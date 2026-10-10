import { BLOOM_LEVELS, bloomDownFragment, bloomUpFragment } from "../shaders/post";
import { Program, type Target, createTarget, deleteTarget, drawTo } from "./gl";

// Piramide de bloom: reduccion de 13 muestras nivel a nivel y subida con filtro tienda sumando
// cada nivel al superior. El nivel 0 (mitad de resolucion) acaba con la suma de todos.
export class Bloom {
  private readonly down: Program;
  private readonly up: Program;
  private levels: Target[] = [];

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.down = new Program(gl, bloomDownFragment);
    this.up = new Program(gl, bloomUpFragment);
  }

  get output(): Target {
    return this.levels[0];
  }

  resize(width: number, height: number): void {
    this.disposeLevels();
    for (let i = 1; i <= BLOOM_LEVELS; i++) {
      this.levels.push(createTarget(this.gl, Math.max(1, width >> i), Math.max(1, height >> i)));
    }
  }

  render(src: Target): void {
    const gl = this.gl;
    this.down.use();
    let from = src;
    for (const level of this.levels) {
      this.down.tex("uSrc", 0, from.texture).f("uTexel", 1 / from.width, 1 / from.height);
      drawTo(gl, level);
      from = level;
    }

    this.up.use();
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    for (let i = this.levels.length - 2; i >= 0; i--) {
      const small = this.levels[i + 1];
      const level = this.levels[i];
      this.up.tex("uSrc", 0, small.texture).f("uTexel", 1 / small.width, 1 / small.height);
      drawTo(gl, level);
    }
    gl.disable(gl.BLEND);
  }

  private disposeLevels(): void {
    for (const t of this.levels) deleteTarget(this.gl, t);
    this.levels = [];
  }

  dispose(): void {
    this.disposeLevels();
    this.down.dispose();
    this.up.dispose();
  }
}
