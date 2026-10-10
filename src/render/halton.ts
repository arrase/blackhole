// Secuencia de Halton de base dada en [0, 1)
export function halton(index: number, base: number): number {
  let f = 1;
  let r = 0;
  for (let i = index; i > 0; i = Math.floor(i / base)) {
    f /= base;
    r += f * (i % base);
  }
  return r;
}

// Ciclo corto: 16 puntos (2,3) ya cubren el pixel con baja discrepancia
const JITTER_PERIOD = 16;

// Desplazamiento subpixel del frame en pixeles, centrado en [-0.5, 0.5)
export function subpixelJitter(frame: number): [number, number] {
  const i = (frame % JITTER_PERIOD) + 1;
  return [halton(i, 2) - 0.5, halton(i, 3) - 0.5];
}
