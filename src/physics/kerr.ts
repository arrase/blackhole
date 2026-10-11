// Kerr en CPU: horizonte, ISCO y tetrada de la camara. Convenios en src/shaders/kerr.ts:
// M = 0.5, a = spin * M, J sobre +y; Kerr-Schild saliente en el layout del shader (t, x, y, z).

export type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];
type Mat4 = Vec4[];

export const M = 0.5;

// Horizonte de eventos: r+ = M + sqrt(M^2 - a^2)
export function rPlus(spin: number): number {
  return M * (1 + Math.sqrt(1 - spin * spin));
}

// ISCO progrado (Bardeen-Press-Teukolsky)
export function rIsco(spin: number): number {
  const z1 = 1 + Math.cbrt(1 - spin * spin) * (Math.cbrt(1 + spin) + Math.cbrt(1 - spin));
  const z2 = Math.sqrt(3 * spin * spin + z1 * z1);
  return M * (3 + z2 - Math.sqrt((3 - z1) * (3 + z1 + 2 * z2)));
}

// Energia y momento angular especificos (Boyer-Lindquist, conservados) de la orbita circular
// prograda en el ISCO: los conserva el gas que cae desde ahi
export function iscoEnergyMomentum(spin: number): { E: number; L: number } {
  const a = spin * M, r = rIsco(spin), sr = Math.sqrt(r), sm = Math.sqrt(M);
  const den = r ** 0.75 * Math.sqrt(r * sr - 3 * M * sr + 2 * a * sm);
  return { E: (r * sr - 2 * M * sr + a * sm) / den, L: (sm * (r * r - 2 * a * sm * sr + a * a)) / den };
}

function minkowskiEta(i: number, j: number): number {
  if (i !== j) return 0;
  return i === 0 ? -1 : 1;
}

// Metrica g_mu_nu = eta + f L_mu L_nu en un punto (indices t, x, y, z del shader)
export function ksMetric(pos: Vec3, spin: number): Mat4 {
  const a = spin * M, a2 = a * a;
  // Orden KS (X, Y, Z) = (z, x, y)
  const [Y, Z, X] = pos;
  const b = X * X + Y * Y + Z * Z - a2;
  const r2 = 0.5 * (b + Math.sqrt(b * b + 4 * a2 * Z * Z)), r = Math.sqrt(r2), d = r2 + a2;
  const f = (2 * M * r2 * r) / (r2 * r2 + a2 * Z * Z);
  const L: Vec4 = [1, -(r * Y + a * X) / d, -Z / r, -(r * X - a * Y) / d];
  return L.map((li, i) => L.map((lj, j) => minkowskiEta(i, j) + f * li * lj) as Vec4);
}

const dot = (g: Mat4, u: Vec4, v: Vec4) => g.reduce((s, row, i) => s + row.reduce((t, gij, j) => t + gij * u[i] * v[j], 0), 0);
const lower = (g: Mat4, v: Vec4) => g.map((row) => row.reduce((s, gij, j) => s + gij * v[j], 0)) as Vec4;

export interface CameraTetrad {
  readonly pos: Vec3;
  readonly pt: number; // p_t de todos los rayos (= U_t)
  readonly u: Vec3; // -U_i: parte del momento de trazado comun a todos los pixeles
  readonly fwd: Vec3; // patas espaciales de la tetrada, covariantes espaciales
  readonly right: Vec3;
  readonly up: Vec3;
}

// Observador estatico (U ∝ d/dt) con tetrada de Gram-Schmidt respecto a g sobre las direcciones de
// coordenadas de la camara. El foton que llega por la direccion n tiene k = U - n (p.U = -1); el
// rayo trazado lleva p = -k_i = n_i - U_i. Solo existe fuera de la ergosfera (r > 1 en el ecuador);
// la camara nunca baja de r = 4.
export function cameraTetrad(pos: Vec3, fwd: Vec3, right: Vec3, up: Vec3, spin: number): CameraTetrad {
  const g = ksMetric(pos, spin);
  const U: Vec4 = [1 / Math.sqrt(-g[0][0]), 0, 0, 0];
  const legs: Vec4[] = [];
  for (const v of [fwd, right, up]) {
    let e: Vec4 = [0, ...v];
    for (const b of [U, ...legs]) {
      const c = dot(g, e, b) / dot(g, b, b);
      e = e.map((x, i) => x - c * b[i]) as Vec4;
    }
    const n = Math.sqrt(dot(g, e, e));
    legs.push(e.map((x) => x / n) as Vec4);
  }
  const Ul = lower(g, U);
  const spatial = (v: Vec4): Vec3 => [v[1], v[2], v[3]];
  const [f, r, u] = legs.map((e) => spatial(lower(g, e)));
  return { pos, pt: Ul[0], u: spatial(Ul).map((x) => -x) as Vec3, fwd: f, right: r, up: u };
}
