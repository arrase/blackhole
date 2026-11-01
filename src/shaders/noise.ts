// Lados de la textura 3D periodica en texels: 64 en azimut (alta resolucion orbital sin costura),
// 128 en ln(r) y 32 en altura vertical (262 144 voxels = 1 MB en RGBA8).
// Canales pre-horneados con 3 octavas C2 sin aliasing: R = rho, G = diss, B = ridge, A = warp.
export const NOISE_SIZE: readonly number[] = [64, 128, 32];

// Escala de codificacion en RGBA8: valor_normalizado = (texel - 0.5) / TURB_SCALE (~ +-2.27 sigma)
export const TURB_SCALE = 0.22;

export const noise = `
uniform sampler3D uNoise;
const vec3 NOISE_SIZE = vec3(${NOISE_SIZE.map((n) => n.toFixed(1)).join(", ")});
const float NOISE_SD = ${TURB_SCALE.toFixed(2)};

// Lectura de los 4 canales pre-horneados (rho, diss, ridge, warp) normalizados a media 0 y varianza 1.
// Las 3 octavas internas (periodos 8, 4 y 2 texels) ya llevan interpolacion quintica C2 en la red
vec4 turbulence(vec3 p, float fp){
  vec4 t = textureLod(uNoise, p / NOISE_SIZE, log2(max(fp, 0.5)));
  return (t - 0.5) / NOISE_SD;
}

// Suavizado quintico C2 de Quilez antes de la interpolacion trilineal de hardware
float noise(vec3 p, float fp){
  vec3 i = floor(p - 0.5);
  vec3 f = p - 0.5 - i;
  vec3 q = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  p = i + mix(q, f, clamp(fp - 0.5, 0.0, 1.0)) + 0.5;
  return textureLod(uNoise, p / NOISE_SIZE, log2(max(fp, 0.5))).r;
}

// fbm normalizado: x = suma centrada de varianza unidad, y = fraccion de varianza que sobrevive al LOD.
// Lacunaridad exactamente 2: conserva la periodicidad azimutal sin costura en todas las octavas
vec2 fbm(vec3 p, float fp, int octaves, float gain){
  float v = 0.0, kept = 0.0, total = 0.0, a = 1.0;
  for(int i = 0; i < octaves; i++){
    float w = 1.0 - smoothstep(1.25, 2.5, fp);
    if(w > 0.0) v += a * w * (noise(p, fp) - 0.5);
    kept += a * a * w * w;
    total += a * a;
    p = p * 2.0 + 1.7;
    fp *= 2.0;
    a *= gain;
  }
  float norm = inversesqrt(total);
  return vec2(v * norm / NOISE_SD, kept / total);
}
`;
