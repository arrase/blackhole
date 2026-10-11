import { type DiskParams, diskParams } from "../physics/disk";
import { cameraTetrad, rIsco, rPlus } from "../physics/kerr";
import { compositeFragment } from "../shaders/post";
import { raymarchFragment } from "../shaders/raymarch";
import { Bloom } from "./bloom";
import { cameraBasis } from "./camera";
import { Program, type Target, createTarget, deleteTarget, drawTo } from "./gl";
import { GpuTimer } from "./gpuTimer";
import { subpixelJitter } from "./halton";
import { createNoiseTexture } from "./noiseTexture";
import { blendWeight, historyKey, sameKey } from "./temporal";
import type { CameraState, SimSettings } from "./types";

// Paso maximo del reloj del gas (s): tras una pestana oculta o una pausa el disco no salta
const MAX_DT = 0.25;

// Periodo (en ciclos del mapa de flujo) del contador de siembras. Par: las fases de las dos capas y
// sus siembras no cambian al restarlo, y el reloj queda acotado con precision de doble para siempre
const EPOCHS = 65536;

// Fraccion de luz dispersada por la optica por unidad del control de brillo: 0.6 (por defecto)
// -> 3 %, del orden del halo de un buen objetivo o del ojo; 2 (maximo) -> 10 %
const SCATTER_PER_GLOW = 0.05;

// Exposicion lineal por unidad del control de intensidad: la intensidad por defecto (0.35) da 1.4.
// El disco ya llega medido (physics/disk.ts): su gas mas brillante vale DISK_BRIGHTNESS
const EXPOSURE_PER_INTENSITY = 4;

export interface Frame {
  readonly camera: CameraState;
  readonly settings: SimSettings;
  readonly dt: number; // s desde el frame anterior
  readonly scale: number; // fraccion de la resolucion del canvas que se traza
}

// Pipeline: raymarch HDR acumulado temporalmente -> piramide de bloom -> composite al canvas
export class Renderer {
  private readonly raymarch: Program;
  private readonly composite: Program;
  private readonly bloom: Bloom;
  private readonly noise: WebGLTexture;
  private readonly vao: WebGLVertexArrayObject;
  private readonly timer: GpuTimer | null;
  private history: Target | null = null;
  private key: number[] = [];
  private samples = 0;
  private frame = 0;
  private flowCycle = 0; // ciclos del mapa de flujo del gas, en [0, EPOCHS)
  private theta = Number.NaN;
  private disk: { spin: number; temp: number; params: DiskParams } | null = null;

  private constructor(private readonly gl: WebGL2RenderingContext) {
    this.raymarch = new Program(gl, raymarchFragment);
    this.composite = new Program(gl, compositeFragment);
    this.bloom = new Bloom(gl);
    this.noise = createNoiseTexture(gl);
    this.timer = GpuTimer.create(gl);
    // WebGL2 exige un VAO enlazado aunque el triangulo no use atributos
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
  }

  // null si no hay WebGL2, no se puede renderizar en coma flotante o los shaders no compilan
  static create(canvas: HTMLCanvasElement): Renderer | null {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl?.getExtension("EXT_color_buffer_float")) return null;
    try {
      return new Renderer(gl);
    } catch (e) {
      // Fallo de compilacion o enlace: perder el contexto libera de una vez todo lo creado
      console.error(e);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return null;
    }
  }

  get hasGpuTimer(): boolean {
    return this.timer !== null;
  }

  // Tiempo de GPU del ultimo frame medido (ms) o null si no hay medida nueva
  pollGpuMs(): number | null {
    return this.timer?.poll() ?? null;
  }

  render({ camera, settings, dt, scale }: Frame): void {
    const gl = this.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const ch = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
    const w = Math.max(1, Math.round(cw * scale));
    const h = Math.max(1, Math.round(ch * scale));
    if (this.history?.width !== w || this.history?.height !== h) this.resize(w, h);
    const history = this.history!;

    const key = historyKey(camera, settings);
    if (!sameKey(key, this.key)) this.samples = 0;
    this.key = key;

    this.timer?.begin();

    // Reloj del gas integrado aqui, en ciclos del mapa de flujo y doble precision: cambiar diskSpeed
    // cambia el ritmo sin saltos de la textura, y el shader solo recibe fases acotadas
    if (this.disk?.spin !== settings.spin || this.disk.temp !== settings.diskTemp) {
      this.disk = { spin: settings.spin, temp: settings.diskTemp, params: diskParams(settings.spin, settings.diskTemp) };
    }
    const disk = this.disk.params;
    const advance = (Math.min(dt, MAX_DT) * settings.diskSpeed) / disk.flowPeriod;
    this.flowCycle = (this.flowCycle + advance) % EPOCHS;
    const layers = [this.flowCycle, this.flowCycle + 0.5];
    // Con la escena quieta la historia promedia sin limite y el ruido converge; si algo se mueve,
    // el obturador acota su edad
    const moving = (settings.accretionDisk && advance > 0) || camera.theta !== this.theta;
    this.theta = camera.theta;
    // Raymarch mezclado sobre la historia: media exponencial por mezcla de hardware, sin ping-pong
    const weight = blendWeight(this.samples, dt, moving);
    // Capa 1 (estrellas del frame) a cero: la mezcla deja en ella weight * salida
    gl.bindFramebuffer(gl.FRAMEBUFFER, history.fbo);
    gl.clearBufferfv(gl.COLOR, 1, [0, 0, 0, 1]);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA);
    gl.blendColor(0, 0, 0, weight);
    const basis = cameraBasis(camera);
    const cam = cameraTetrad(basis.pos, basis.fwd, basis.right, basis.up, settings.spin);
    const [jx, jy] = subpixelJitter(this.frame);
    this.raymarch
      .use()
      .tex("uNoise", 0, this.noise, gl.TEXTURE_3D)
      .f("uRes", w, h)
      .f("uJitter", jx, jy)
      .f("uHistoryWeight", weight)
      .f("uFrame", this.frame % 64)
      .f("uCamPos", ...cam.pos)
      .f("uCamFwd", ...cam.fwd)
      .f("uCamRight", ...cam.right)
      .f("uCamUp", ...cam.up)
      .f("uCamU", ...cam.u)
      .f("uPt", cam.pt)
      .f("uFov", settings.fov)
      .f("uFlowPeriod", disk.flowPeriod)
      .f("uLayerPhase", ...layers.map((c) => c - Math.floor(c)))
      .f("uLayerEpoch", ...layers.map((c) => Math.floor(c) % EPOCHS))
      .f("uIscoEL", disk.iscoE, disk.iscoL)
      .f("uNtRoots", ...disk.pt.roots)
      .f("uNtCoefs", ...disk.pt.coefs)
      .f("uFluxPeak", disk.fluxPeak)
      .f("uTPeak", disk.tPeak)
      .f("uDiskUnit", disk.unit)
      .f("uStars", settings.stars)
      .f("uSpin", settings.spin)
      .f("uRPlus", rPlus(settings.spin))
      .f("uRIsco", rIsco(settings.spin))
      .f("uAccretionDisk", settings.accretionDisk ? 1 : 0);
    drawTo(gl, history);
    gl.disable(gl.BLEND);
    this.samples++;

    this.bloom.render(history);

    const bloom = this.bloom.output;
    this.composite
      .use()
      .tex("uScene", 0, history.texture)
      .tex("uBloom", 1, bloom.texture)
      .tex("uStarLayer", 2, history.layers[1])
      .f("uBloomTexel", 1 / bloom.width, 1 / bloom.height)
      .f("uScatter", settings.glow * SCATTER_PER_GLOW)
      .f("uExposure", settings.intensity * EXPOSURE_PER_INTENSITY)
      .f("uFov", settings.fov)
      .f("uAspect", cw / ch)
      .f("uFrame", this.frame % 64);
    drawTo(gl, null, cw, ch);

    this.timer?.end();
    this.frame++;
  }

  private resize(w: number, h: number): void {
    if (this.history) deleteTarget(this.gl, this.history);
    // Capa 0: radiancia acumulada; capa 1: estrellas del frame (ver raymarch.ts)
    this.history = createTarget(this.gl, w, h, 2);
    this.bloom.resize(w, h);
    this.samples = 0;
  }

  dispose(): void {
    const gl = this.gl;
    if (this.history) deleteTarget(gl, this.history);
    this.bloom.dispose();
    this.raymarch.dispose();
    this.composite.dispose();
    this.timer?.dispose();
    gl.deleteTexture(this.noise);
    gl.deleteVertexArray(this.vao);
  }
}
