// Tiempo de GPU por frame con EXT_disjoint_timer_query_webgl2. Los resultados llegan con
// algunos frames de retraso; se descartan los intervalos marcados como disjuntos.
interface TimerExt {
  readonly TIME_ELAPSED_EXT: number;
  readonly GPU_DISJOINT_EXT: number;
}

const MAX_IN_FLIGHT = 4;

export class GpuTimer {
  private readonly pending: WebGLQuery[] = [];
  private active: WebGLQuery | null = null;

  private constructor(private readonly gl: WebGL2RenderingContext, private readonly ext: TimerExt) {}

  static create(gl: WebGL2RenderingContext): GpuTimer | null {
    const ext = gl.getExtension("EXT_disjoint_timer_query_webgl2") as TimerExt | null;
    return ext ? new GpuTimer(gl, ext) : null;
  }

  begin(): void {
    if (this.pending.length >= MAX_IN_FLIGHT) return;
    this.active = this.gl.createQuery()!;
    this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.active);
  }

  end(): void {
    if (!this.active) return;
    this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
    this.pending.push(this.active);
    this.active = null;
  }

  // Ultima medida disponible en ms, o null si aun no ha llegado ninguna nueva
  poll(): number | null {
    const gl = this.gl;
    let ms: number | null = null;
    while (this.pending.length && gl.getQueryParameter(this.pending[0], gl.QUERY_RESULT_AVAILABLE)) {
      const q = this.pending.shift()!;
      const ns = gl.getQueryParameter(q, gl.QUERY_RESULT) as number;
      if (!gl.getParameter(this.ext.GPU_DISJOINT_EXT)) ms = ns / 1e6;
      gl.deleteQuery(q);
    }
    return ms;
  }

  dispose(): void {
    for (const q of this.pending) this.gl.deleteQuery(q);
    this.pending.length = 0;
  }
}
