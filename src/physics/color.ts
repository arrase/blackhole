// Cuerpo negro -> sRGB lineal en CPU; src/shaders/color.ts genera el GLSL con estas constantes.
// Ajuste por canal de la ley de Planck SIN normalizar a la integral CIE 1931 (Wyman-Sloan-Shirley)
// del espectro: B = W / (exp(C / T) - 1), T en kK, luminancia Y(6.5 kK) = 1. Error < 5 % del canal
// mayor y < 4 % en luminancia entre 2 y 20 kK. Al no normalizar, B(g T) es a la vez el color y el
// brillo observados: g^3 I_nu(nu / g, T) = I_nu(nu, g T) (beaming y corrimiento en un solo paso).
export const BLACKBODY_C: readonly number[] = [22.748, 26.473, 33.499];
export const BLACKBODY_W: readonly number[] = [33.398, 57.022, 172.22];
// T minima evaluada: por debajo la radiancia visible es nula a efectos practicos y exp no desborda
export const T_MIN = 0.5;
// Coeficientes de luminancia de sRGB (Rec. 709)
export const LUMA: readonly number[] = [0.2126, 0.7152, 0.0722];

export function blackbody(T: number): number[] {
  return BLACKBODY_C.map((c, i) => BLACKBODY_W[i] / Math.expm1(c / Math.max(T, T_MIN)));
}

export function luminance(c: readonly number[]): number {
  return c.reduce((s, v, i) => s + v * LUMA[i], 0);
}
