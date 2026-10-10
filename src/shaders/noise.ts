// Lados de la textura de ruido en texels (periodo de repeticion por eje). 64 se ve igual que 128 (el
// disco la recorre en coordenadas logaritmicas y advectadas que rompen la repeticion) con 8 veces menos
// memoria. El eje x es el azimut del gas: un periodo corto da celdas largas sin costura en la vuelta
export const NOISE_SIZE: readonly number[] = [16, 64, 64];

// Ruido de valor 3D leido de una textura R8 tileable con mipmaps. Coordenadas en
// celdas de red (1 unidad = 1 texel). fp es la huella del pixel en esas unidades:
// fija el mip y permite saltarse las octavas mas finas que el pixel.
export const noise = `
uniform sampler3D uNoise;
const vec3 NOISE_SIZE = vec3(${NOISE_SIZE.map((n) => n.toFixed(1)).join(", ")});
// Desviacion tipica de una octava (valores uniformes interpolados trilinealmente), medida
const float NOISE_SD = 0.158;

// Interpolacion trilineal del hardware: visualmente equivalente a la de Hermite y ~1.75x mas
// rapida en Alta (medido). LOD explicito: en el bucle del raymarch las derivadas implicitas no estan definidas
float noise(vec3 p, float fp){
  return textureLod(uNoise, p / NOISE_SIZE, log2(max(fp, 1.0))).r;
}

// fbm normalizado: x = suma de octavas centrada con varianza unidad (casi gaussiana), y = fraccion
// de esa varianza que sobrevive al LOD. Lacunaridad exactamente 2: conserva la periodicidad de la
// textura en todas las octavas (coordenadas angulares sin costura). gain: amplitud relativa de cada
// octava (pendiente del espectro)
vec2 fbm(vec3 p, float fp, int octaves, float gain){
  float v = 0.0, kept = 0.0, total = 0.0, a = 1.0;
  for(int i = 0; i < octaves; i++){
    // Octava mas fina que el pixel: se funde hacia su media y deja de leerse, sin aliasing
    float w = 1.0 - smoothstep(1.0, 2.0, fp);
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
