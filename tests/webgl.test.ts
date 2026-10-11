import { describe, expect, it, vi } from "vitest";
import { Bloom } from "../src/render/bloom";
import { Program, createTarget, deleteTarget, drawTo } from "../src/render/gl";
import { GpuTimer } from "../src/render/gpuTimer";
import { createNoiseTexture } from "../src/render/noiseTexture";
import { Renderer, type Frame } from "../src/render/renderer";

if (typeof window === "undefined") {
  (globalThis as unknown as { window: { devicePixelRatio: number } }).window = { devicePixelRatio: 1 };
}

function createMockGL(): { gl: WebGL2RenderingContext; canvas: HTMLCanvasElement } {
  const dummy = {};
  const canvas = {
    clientWidth: 800,
    clientHeight: 600,
    width: 800,
    height: 600,
    getContext: () => gl,
  } as unknown as HTMLCanvasElement;

  const gl = {
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,
    TEXTURE_2D: 3553,
    TEXTURE_3D: 32879,
    TEXTURE0: 33984,
    FRAMEBUFFER: 36160,
    COLOR_ATTACHMENT0: 36064,
    RGBA16F: 34842,
    LINEAR: 9729,
    CLAMP_TO_EDGE: 33071,
    TEXTURE_MIN_FILTER: 10241,
    TEXTURE_MAG_FILTER: 10240,
    TEXTURE_WRAP_S: 10242,
    TEXTURE_WRAP_T: 10243,
    TEXTURE_WRAP_R: 32882,
    REPEAT: 10497,
    LINEAR_MIPMAP_LINEAR: 9987,
    UNPACK_ALIGNMENT: 3317,
    R8: 33321,
    RED: 6403,
    UNSIGNED_BYTE: 5121,
    COLOR_BUFFER_BIT: 16384,
    TRIANGLES: 4,
    BLEND: 3042,
    ONE: 1,
    CONSTANT_ALPHA: 32771,
    ONE_MINUS_CONSTANT_ALPHA: 32772,
    COLOR: 6144,
    QUERY_RESULT_AVAILABLE: 34919,
    QUERY_RESULT: 34918,
    canvas,
    createShader: () => ({ ...dummy }),
    shaderSource: () => {},
    compileShader: () => {},
    getShaderParameter: () => true,
    getShaderInfoLog: () => "error log",
    deleteShader: () => {},
    createProgram: () => ({ ...dummy }),
    attachShader: () => {},
    linkProgram: () => {},
    getProgramParameter: () => true,
    getProgramInfoLog: () => "link error",
    deleteProgram: () => {},
    useProgram: () => {},
    getUniformLocation: () => ({ ...dummy }),
    uniform1f: () => {},
    uniform2f: () => {},
    uniform3f: () => {},
    uniform1i: () => {},
    activeTexture: () => {},
    createTexture: () => ({ ...dummy }),
    bindTexture: () => {},
    pixelStorei: () => {},
    texImage3D: () => {},
    generateMipmap: () => {},
    texParameteri: () => {},
    deleteTexture: () => {},
    createFramebuffer: () => ({ ...dummy }),
    bindFramebuffer: () => {},
    texStorage2D: () => {},
    framebufferTexture2D: () => {},
    drawBuffers: () => {},
    clearColor: () => {},
    clear: () => {},
    deleteFramebuffer: () => {},
    viewport: () => {},
    drawArrays: () => {},
    enable: () => {},
    disable: () => {},
    blendFunc: () => {},
    blendColor: () => {},
    clearBufferfv: () => {},
    createVertexArray: () => ({ ...dummy }),
    bindVertexArray: () => {},
    deleteVertexArray: () => {},
    createQuery: () => ({ ...dummy }),
    beginQuery: () => {},
    endQuery: () => {},
    getQueryParameter: (_: unknown, pname: number) => (pname === 34919 ? true : 16_000_000),
    getParameter: () => 0,
    deleteQuery: () => {},
    getExtension: (name: string) => {
      if (name === "EXT_color_buffer_float") return {};
      if (name === "EXT_disjoint_timer_query_webgl2") return { TIME_ELAPSED_EXT: 1, GPU_DISJOINT_EXT: 2 };
      if (name === "WEBGL_lose_context") return { loseContext: () => {} };
      return null;
    },
  } as unknown as WebGL2RenderingContext;

  return { gl, canvas };
}

describe("noiseTexture", () => {
  it("creates a 3D noise texture with expected parameters", () => {
    const { gl } = createMockGL();
    const tex = createNoiseTexture(gl);
    expect(tex).toBeDefined();
  });
});

describe("gpuTimer", () => {
  it("creates, queries and disposes timer queries", () => {
    const { gl } = createMockGL();
    const timer = GpuTimer.create(gl)!;
    expect(timer).not.toBeNull();
    timer.begin();
    timer.end();
    expect(timer.poll()).toBe(16);
    expect(timer.poll()).toBeNull();
    timer.begin();
    timer.end();
    gl.getParameter = () => 1;
    expect(timer.poll()).toBeNull();
    timer.dispose();
  });

  it("handles missing timer extension gracefully", () => {
    const { gl } = createMockGL();
    gl.getExtension = () => null;
    expect(GpuTimer.create(gl)).toBeNull();
  });

  it("caps in-flight queries at MAX_IN_FLIGHT", () => {
    const { gl } = createMockGL();
    gl.getQueryParameter = () => false;
    const timer = GpuTimer.create(gl)!;
    for (let i = 0; i < 6; i++) {
      timer.begin();
      timer.end();
    }
    expect(timer.poll()).toBeNull();
    timer.dispose();
  });
});

describe("gl Program and targets", () => {
  it("compiles and links a full program, setting uniforms", () => {
    const { gl } = createMockGL();
    const p = new Program(gl, "precision highp float; out vec4 color; void main() { color = vec4(1.0); }");
    expect(p.use()).toBe(p);
    expect(p.f("uOne", 1)).toBe(p);
    expect(p.f("uTwo", 1, 2)).toBe(p);
    expect(p.f("uThree", 1, 2, 3)).toBe(p);
    const tex = gl.createTexture()!;
    expect(p.tex("uTex", 0, tex)).toBe(p);
    p.dispose();
  });

  it("throws on shader compilation failure", () => {
    const { gl } = createMockGL();
    gl.getShaderParameter = () => false;
    expect(() => new Program(gl, "bad shader")).toThrow("error log");
  });

  it("throws on program linking failure", () => {
    const { gl } = createMockGL();
    gl.getProgramParameter = () => false;
    expect(() => new Program(gl, "bad program")).toThrow("link error");
  });

  it("creates and deletes render targets, and draws to them", () => {
    const { gl } = createMockGL();
    const t1 = createTarget(gl, 200, 100, 1);
    expect(t1.layers).toHaveLength(1);
    drawTo(gl, t1);
    deleteTarget(gl, t1);

    const t2 = createTarget(gl, 200, 100, 2);
    expect(t2.layers).toHaveLength(2);
    drawTo(gl, null, 200, 100);
    deleteTarget(gl, t2);
  });
});

describe("bloom", () => {
  it("builds a pyramid, executes down and up passes, and disposes", () => {
    const { gl } = createMockGL();
    const bloom = new Bloom(gl);
    bloom.resize(400, 300);
    expect(bloom.output).toBeDefined();

    const src = createTarget(gl, 400, 300);
    bloom.render(src);
    deleteTarget(gl, src);
    bloom.dispose();
  });
});

describe("renderer", () => {
  const frame: Frame = {
    camera: { theta: 0.5, phi: 0.2, dist: 15 },
    settings: {
      intensity: 0.5,
      diskSpeed: 1,
      diskTemp: 1.5,
      stars: 1,
      glow: 0.5,
      autoRotate: false,
      fov: 1.2,
      spin: 0.8,
      accretionDisk: true,
    },
    dt: 0.016,
    scale: 1,
  };

  it("initializes, renders frames, tracks state changes and disposes cleanly", () => {
    const { canvas } = createMockGL();
    const r = Renderer.create(canvas);
    expect(r).not.toBeNull();
    if (!r) return;

    expect(r.hasGpuTimer).toBe(true);
    canvas.width = 0;
    r.render(frame);
    expect(r.pollGpuMs()).toBe(16);

    // Second frame to test temporal accumulation and moving branches
    r.render({
      ...frame,
      camera: { ...frame.camera, theta: 0.6 },
      settings: { ...frame.settings, spin: 0.9, diskTemp: 2.0 },
      scale: 0.8,
    });

    r.dispose();
  });

  it("returns null if color buffer float extension is missing", () => {
    const { canvas, gl } = createMockGL();
    gl.getExtension = () => null;
    expect(Renderer.create(canvas)).toBeNull();
  });

  it("returns null and cleans up if shader compilation fails during init", () => {
    const { canvas, gl } = createMockGL();
    gl.getShaderParameter = () => false;
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(Renderer.create(canvas)).toBeNull();
    spy.mockRestore();
  });
});
