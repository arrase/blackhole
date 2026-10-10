import { BLACKBODY_C, BLACKBODY_W, LUMA, T_MIN } from "../physics/color";

// Cuerpo negro -> sRGB lineal: el mismo ajuste que physics/color.ts
const vec3 = (v: readonly number[]) => `vec3(${v.join(", ")})`;

export const color = `
const vec3 LUMA = ${vec3(LUMA)};
vec3 blackbody(float T){
  return ${vec3(BLACKBODY_W)} / (exp(${vec3(BLACKBODY_C)} / max(T, ${T_MIN.toFixed(1)})) - 1.0);
}
`;
