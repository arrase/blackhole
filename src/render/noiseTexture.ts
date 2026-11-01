import { NOISE_SIZE, TURB_SCALE } from "../shaders/noise";

// Generador pseudoaleatorio mulberry32: determinista, la textura es identica en cada carga
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Valores independientes por texel: con REPEAT la red es periodica sin costuras por construccion
export function generateNoise(texels: number, seed = 1): Uint8Array {
  const rand = mulberry32(seed);
  const data = new Uint8Array(texels);
  for (let i = 0; i < data.length; i++) data[i] = Math.floor(rand() * 256);
  return data;
}

const quintic = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

// Evalua una octava de ruido de valor 3D periodico con interpolacion quintica C2 sobre una red
// gruesa de lados (gw, gh, gd) proyectada en el volumen de destino (w, h, d)
function addOctave(
  out: Float32Array,
  w: number,
  h: number,
  d: number,
  step: number,
  amp: number,
  rand: () => number,
): void {
  const gw = w / step, gh = h / step, gd = d / step;
  const grid = new Float32Array(gw * gh * gd);
  for (let i = 0; i < grid.length; i++) grid[i] = rand() - 0.5;

  const ix0 = new Int32Array(w), ix1 = new Int32Array(w), wx = new Float32Array(w);
  const iy0 = new Int32Array(h), iy1 = new Int32Array(h), wy = new Float32Array(h);
  const iz0 = new Int32Array(d), iz1 = new Int32Array(d), wz = new Float32Array(d);
  for (let x = 0; x < w; x++) {
    const u = x / step, i = Math.floor(u);
    ix0[x] = i % gw; ix1[x] = (i + 1) % gw; wx[x] = quintic(u - i);
  }
  for (let y = 0; y < h; y++) {
    const u = y / step, i = Math.floor(u);
    iy0[y] = (i % gh) * gw; iy1[y] = ((i + 1) % gh) * gw; wy[y] = quintic(u - i);
  }
  for (let z = 0; z < d; z++) {
    const u = z / step, i = Math.floor(u);
    iz0[z] = (i % gd) * gh * gw; iz1[z] = ((i + 1) % gd) * gh * gw; wz[z] = quintic(u - i);
  }

  let idx = 0;
  for (let z = 0; z < d; z++) {
    const z0 = iz0[z], z1 = iz1[z], fz = wz[z];
    for (let y = 0; y < h; y++) {
      const y00 = z0 + iy0[y], y10 = z0 + iy1[y], y01 = z1 + iy0[y], y11 = z1 + iy1[y], fy = wy[y];
      for (let x = 0; x < w; x++) {
        const x0 = ix0[x], x1 = ix1[x], fx = wx[x];
        const c00 = grid[y00 + x0] + fx * (grid[y00 + x1] - grid[y00 + x0]);
        const c10 = grid[y10 + x0] + fx * (grid[y10 + x1] - grid[y10 + x0]);
        const c01 = grid[y01 + x0] + fx * (grid[y01 + x1] - grid[y01 + x0]);
        const c11 = grid[y11 + x0] + fx * (grid[y11 + x1] - grid[y11 + x0]);
        const c0 = c00 + fy * (c10 - c00);
        const c1 = c01 + fy * (c11 - c01);
        out[idx++] += amp * (c0 + fz * (c1 - c0));
      }
    }
  }
}

// Normaliza un canal a media 0 y desviacion tipica 1 y lo empaqueta en el canal `ch` de `rgba`
function packNormalizedChannel(rgba: Uint8Array, ch: number, buf: Float32Array): void {
  const n = buf.length;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += buf[i];
  const mean = sum / n;
  let varSum = 0;
  for (let i = 0; i < n; i++) {
    const d = buf[i] - mean;
    varSum += d * d;
  }
  const scale = TURB_SCALE / Math.sqrt(varSum / n);
  for (let i = 0; i < n; i++) {
    const u = Math.min(1, Math.max(0, 0.5 + (buf[i] - mean) * scale));
    rgba[i * 4 + ch] = Math.round(u * 255);
  }
}

// Volumen RGBA8 periodico con 3 octavas sin aliasing (pasos de 8, 4 y 2 texels; espectro Kolmogorov):
// R = densidad (rho), G = disipacion (diss), B = hojas de corriente MHD (ridge = -|g|), A = warp
export function generateTurbulence(w: number, h: number, d: number, seed = 1): Uint8Array {
  const rand = mulberry32(seed);
  const voxels = w * h * d;
  const rgba = new Uint8Array(voxels * 4);
  const gain = 0.78;

  const rho = new Float32Array(voxels);
  const diss = new Float32Array(voxels);
  const rawRidge = new Float32Array(voxels);
  const warp = new Float32Array(voxels);

  for (const [step, amp] of [[8, 1], [4, gain], [2, gain * gain]] as const) {
    addOctave(rho, w, h, d, step, amp, rand);
    addOctave(diss, w, h, d, step, amp, rand);
    addOctave(rawRidge, w, h, d, step, amp * 0.96, rand);
  }
  for (let i = 0; i < voxels; i++) rawRidge[i] = -Math.abs(rawRidge[i]);

  addOctave(warp, w, h, d, 8, 1, rand);
  addOctave(warp, w, h, d, 4, 0.55, rand);

  packNormalizedChannel(rgba, 0, rho);
  packNormalizedChannel(rgba, 1, diss);
  packNormalizedChannel(rgba, 2, rawRidge);
  packNormalizedChannel(rgba, 3, warp);
  return rgba;
}

export function createNoiseTexture(gl: WebGL2RenderingContext): WebGLTexture {
  const tex = gl.createTexture()!;
  const [w, h, d] = NOISE_SIZE;
  gl.bindTexture(gl.TEXTURE_3D, tex);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, w, h, d, 0, gl.RGBA, gl.UNSIGNED_BYTE, generateTurbulence(w, h, d));
  gl.generateMipmap(gl.TEXTURE_3D);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  for (const wrap of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_R]) {
    gl.texParameteri(gl.TEXTURE_3D, wrap, gl.REPEAT);
  }
  return tex;
}
