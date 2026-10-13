// Lados de la textura de ruido en texels (periodo de repeticion por eje). 16x128x128 (256 KB en R8)
// da celdas largas en azimut (sin costura) y alta resolucion radial y vertical para los filamentos
export const NOISE_SIZE: readonly number[] = [16, 128, 128];

// Ruido de valor 3D leido de una textura R8 tileable con mipmaps y suavizado quintico C2 sub-texel.
// Coordenadas en celdas de red (1 unidad = 1 texel). fp es la huella del pixel en esas unidades:
// fija el mip y permite saltarse las octavas mas finas que el pixel.
export const noise = `
uniform sampler3D uNoise;
const vec3 NOISE_SIZE = vec3(${NOISE_SIZE.map((n) => n.toFixed(1)).join(", ")});
// Desviacion tipica de una octava con suavizado quintico sub-texel, medida
const float NOISE_SD = 0.175;

// Suavizado quintico C2 de Quilez antes de la interpolacion trilineal de hardware: elimina las
// aristas de derivada discontinua de la red lineal con una sola lectura de textura y se funde al
// muestreo lineal cuando actuan los mipmaps (fp >= 1)
float noise(vec3 p, float fp){
  vec3 i = floor(p - 0.5);
  vec3 f = p - 0.5 - i;
  vec3 q = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  p = i + mix(q, f, clamp(fp - 0.5, 0.0, 1.0)) + 0.5;
  return textureLod(uNoise, p / NOISE_SIZE, log2(max(fp, 0.5))).r;
}

// fbm normalizado: x = suma de octavas centrada con varianza unidad (casi gaussiana), y = fraccion
// de esa varianza que sobrevive al LOD. Lacunaridad exactamente 2: conserva la periodicidad de la
// textura en todas las octavas (coordenadas angulares sin costura). gain: amplitud relativa de cada
// octava (pendiente del espectro)
vec2 fbm(vec3 p, float fp, int octaves, float gain){
  float v = 0.0, kept = 0.0, total = 0.0, a = 1.0;
  for(int i = 0; i < octaves; i++){
    // Octava mas fina que el pixel: se funde hacia su media al cruzar el limite de Nyquist
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
