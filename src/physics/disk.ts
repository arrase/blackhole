// Disco de Novikov-Thorne en CPU: lo que es constante en todo el frame se calcula aqui una vez y
// llega al shader como uniformes (src/shaders/disk.ts usa las mismas formulas por punto).
import { blackbody, luminance } from "./color";
import { M, iscoEnergyMomentum, rIsco } from "./kerr";

// Temperatura efectiva de pico (kK) de un disco de Schwarzschild con diskTemp = 1. diskTemp hace de
// tasa de acrecion (T ∝ Mdot^(1/4)); el giro sube el pico por si solo (x2 a spin 0.85)
export const T_UNIT = 2;

// Brillo del gas mas brillante respecto al cielo (artistico: con el real las estrellas serian
// invisibles). Con la exposicion por defecto deja la mayor parte del disco en los tonos medios
export const DISK_BRIGHTNESS = 8;

// Flujo de Page-Thorne en x = sqrt(r / M):
// F = 3 Mdot / (8 pi M^2) * [x - x0 - 3/2 a ln(x/x0) - sum_i c_i ln((x - x_i)/(x0 - x_i))] / (x^4 (x^3 - 3x + 2a))
// con x_i las raices de x^3 - 3x + 2a y c_i = 3 (x_i - a)^2 / (x_i (x_i - x_j)(x_i - x_k)), a = spin
interface PageThorne {
  readonly x0: number;
  readonly roots: readonly number[];
  readonly coefs: readonly number[];
}

function pageThorne(spin: number): PageThorne {
  const th = Math.acos(spin);
  const roots = [2 * Math.cos((th - Math.PI) / 3), 2 * Math.cos((th + Math.PI) / 3), -2 * Math.cos(th / 3)];
  const coefs = roots.map((xi, i) => {
    const [xj, xk] = roots.filter((_, k) => k !== i);
    return (3 * (xi - spin) ** 2) / (xi * (xi - xj) * (xi - xk));
  });
  return { x0: Math.sqrt(rIsco(spin) / M), roots, coefs };
}

// Flujo en unidades de 3 Mdot / (8 pi M^2); nulo en el ISCO (par nulo) y dentro
export function pageThorneFlux(r: number, spin: number, pt: PageThorne = pageThorne(spin)): number {
  const x = Math.sqrt(r / M), { x0, roots, coefs } = pt;
  if (x <= x0) return 0;
  let b = x - x0 - 1.5 * spin * Math.log(x / x0);
  roots.forEach((xi, i) => (b -= coefs[i] * Math.log((x - xi) / (x0 - xi))));
  return b / (x ** 4 * (x ** 3 - 3 * x + 2 * spin));
}

// Velocidad angular de la orbita circular prograda (Boyer-Lindquist)
export function keplerOmega(r: number, spin: number): number {
  return Math.sqrt(M) / (r ** 1.5 + spin * M * Math.sqrt(M));
}

// Maximo corrimiento g de la orbita circular de radio r: fotones emitidos hacia delante, tangentes a
// la orbita (lambda = -p_phi / p_t maximo), g = 1 / (u^t (1 - Omega lambda))
export function dopplerMax(r: number, spin: number): number {
  const a = spin * M, sm = Math.sqrt(M);
  const delta = r * r - 2 * M * r + a * a, A = (r * r + a * a) ** 2 - a * a * delta;
  // Lapso, arrastre y radio de giro del observador de momento angular nulo en el ecuador
  const alpha = Math.sqrt((delta * r * r) / A), omega = (2 * M * a * r) / A, varpi = Math.sqrt(A) / r;
  const ut = (r ** 1.5 + a * sm) / (r ** 0.75 * Math.sqrt(r ** 1.5 - 3 * M * Math.sqrt(r) + 2 * a * sm));
  return 1 / (ut * (1 - (keplerOmega(r, spin) * varpi) / (alpha + varpi * omega)));
}

// Maximo del flujo: unimodal en [r_isco, 4 r_isco] (seccion aurea)
export function fluxPeak(spin: number): { r: number; F: number } {
  const pt = pageThorne(spin), k = (Math.sqrt(5) - 1) / 2;
  let lo = rIsco(spin), hi = 4 * lo;
  for (let i = 0; i < 60; i++) {
    const a = hi - k * (hi - lo), b = lo + k * (hi - lo);
    if (pageThorneFlux(a, spin, pt) > pageThorneFlux(b, spin, pt)) hi = b;
    else lo = a;
  }
  const r = (lo + hi) / 2;
  return { r, F: pageThorneFlux(r, spin, pt) };
}

export interface DiskParams {
  readonly pt: PageThorne;
  readonly fluxPeak: number;
  readonly tPeak: number; // kK
  readonly unit: number; // DISK_BRIGHTNESS / luminancia del gas mas brillante
  readonly flowPeriod: number; // r_s / c
  readonly iscoE: number;
  readonly iscoL: number;
}

const schwarzschildPeak = fluxPeak(0).F;

export function diskParams(spin: number, diskTemp: number): DiskParams {
  const peak = fluxPeak(spin);
  const tPeak = diskTemp * T_UNIT * (peak.F / schwarzschildPeak) ** 0.25;
  const { E, L } = iscoEnergyMomentum(spin);
  return {
    pt: pageThorne(spin),
    fluxPeak: peak.F,
    tPeak,
    // Exposicion del disco medida en el gas mas brillante posible: el de T maxima visto con el maximo
    // Doppler de su orbita. Asi diskTemp y el giro cambian el color sin hundir o quemar la imagen (en
    // el visible el brillo va como exp(-C / T)) y la radiancia cabe en RGBA16F a cualquier temperatura
    unit: DISK_BRIGHTNESS / luminance(blackbody(tPeak * dopplerMax(peak.r, spin))),
    // Ventana del mapa de flujo: los remolinos MRI viven ~media orbita; se toma la del radio de pico,
    // que domina la imagen. Una ventana unica para todo r mantiene acotada la cizalla de la textura
    flowPeriod: Math.PI / keplerOmega(peak.r, spin),
    iscoE: E,
    iscoL: L,
  };
}
