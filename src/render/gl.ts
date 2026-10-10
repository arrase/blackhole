import { fullscreenVertex } from "../shaders/common";

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

// Programa de pasada a pantalla completa con cache de ubicaciones de uniformes
export class Program {
  private readonly program: WebGLProgram;
  private readonly locations = new Map<string, WebGLUniformLocation | null>();

  constructor(private readonly gl: WebGL2RenderingContext, fragment: string) {
    const vs = compile(gl, gl.VERTEX_SHADER, fullscreenVertex);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(this.program) ?? "program");
    }
  }

  use(): this {
    this.gl.useProgram(this.program);
    return this;
  }

  private loc(name: string): WebGLUniformLocation | null {
    if (!this.locations.has(name)) this.locations.set(name, this.gl.getUniformLocation(this.program, name));
    return this.locations.get(name)!;
  }

  f(name: string, ...v: number[]): this {
    const l = this.loc(name);
    if (v.length === 1) this.gl.uniform1f(l, v[0]);
    else if (v.length === 2) this.gl.uniform2f(l, v[0], v[1]);
    else this.gl.uniform3f(l, v[0], v[1], v[2]);
    return this;
  }

  // Asocia un sampler a una unidad de textura
  tex(name: string, unit: number, texture: WebGLTexture, target: number = this.gl.TEXTURE_2D): this {
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(target, texture);
    this.gl.uniform1i(this.loc(name), unit);
    return this;
  }

  dispose(): void {
    this.gl.deleteProgram(this.program);
  }
}

// Destino de render HDR: RGBA16F con filtrado lineal (requiere EXT_color_buffer_float). Con varias
// capas, el fragmento escribe en todas a la vez (location = indice de la capa)
export interface Target {
  readonly texture: WebGLTexture;
  readonly layers: readonly WebGLTexture[];
  readonly fbo: WebGLFramebuffer;
  readonly width: number;
  readonly height: number;
}

export function createTarget(gl: WebGL2RenderingContext, width: number, height: number, count = 1): Target {
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  const layers = Array.from({ length: count }, (_, i) => {
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA16F, width, height);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, texture, 0);
    return texture;
  });
  gl.drawBuffers(layers.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return { texture: layers[0], layers, fbo, width, height };
}

export function deleteTarget(gl: WebGL2RenderingContext, t: Target): void {
  gl.deleteFramebuffer(t.fbo);
  t.layers.forEach((l) => gl.deleteTexture(l));
}

// Dibuja el triangulo de pantalla completa sobre el destino (null = canvas)
export function drawTo(
  gl: WebGL2RenderingContext,
  target: Target | null,
  width = target!.width,
  height = target!.height,
): void {
  gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null);
  gl.viewport(0, 0, width, height);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
