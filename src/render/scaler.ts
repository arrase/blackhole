// Escala de render adaptativa: ajusta la fraccion de resolucion para mantener el tiempo de frame
// en el objetivo. El coste del raymarch es proporcional a los pixeles, es decir a scale^2.

export interface ScalerOptions {
  readonly targetMs: number;
  readonly minScale: number;
  readonly maxScale: number;
}

const QUANTUM = 0.05; // escalones de escala: solo se realocan destinos al cruzar uno
const SMOOTHING = 0.1; // suavizado exponencial de las medidas
const SETTLE = 20; // medidas tras un cambio antes de volver a decidir (las consultas GPU llegan con retraso)
const SLOW = 1.15; // histeresis: por encima de target*SLOW se baja la escala
const FAST = 0.8; // por debajo de target*FAST hay margen medible y se sube
const PROBE = 180; // sin margen medible (vsync) se prueba un escalon arriba cada PROBE medidas...
const MAX_SAMPLE_MS = 250; // ...e ignoran los saltos de pestana oculta o pausas del recolector

const quantize = (s: number) => Math.round(s / QUANTUM) * QUANTUM;

export class AdaptiveScaler {
  private ema = 0;
  private sinceChange = 0;
  private probeEvery = PROBE;
  private probed = false;
  scale: number;

  constructor(private options: ScalerOptions) {
    this.scale = options.maxScale;
  }

  // Cambia el objetivo o los limites (p. ej. al cambiar la calidad) y vuelve al maximo
  configure(options: ScalerOptions): void {
    this.options = options;
    this.scale = options.maxScale;
    this.reset();
  }

  // Devuelve true si la escala cambia
  update(ms: number): boolean {
    if (ms > MAX_SAMPLE_MS) return false;
    this.ema = this.ema === 0 ? ms : this.ema + (ms - this.ema) * SMOOTHING;
    if (++this.sinceChange < SETTLE) return false;

    const { targetMs, minScale, maxScale } = this.options;
    const ideal = Math.floor((this.scale * Math.sqrt(targetMs / this.ema)) / QUANTUM + 1e-6) * QUANTUM;
    let next = this.scale;
    let probe = false;
    if (this.ema > targetMs * SLOW) next = Math.min(this.scale - QUANTUM, ideal);
    else if (this.ema < targetMs * FAST) next = Math.max(this.scale + QUANTUM, ideal);
    else if (this.sinceChange >= this.probeEvery) {
      next = this.scale + QUANTUM;
      probe = true;
    }
    next = Math.min(maxScale, Math.max(minScale, quantize(next)));
    if (next === this.scale) return false;

    // Sondeo fallido (hubo que bajar justo despues): se espacian los siguientes
    if (next < this.scale && this.probed) this.probeEvery *= 2;
    this.probed = probe;
    this.scale = next;
    this.reset();
    return true;
  }

  private reset(): void {
    this.ema = 0;
    this.sinceChange = 0;
  }
}
