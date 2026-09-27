import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { fragmentShader, vertexShader } from "./shaders";

export interface SimSettings {
  readonly intensity: number;
  readonly diskSpeed: number;
  readonly quality: number; // 0 baja, 1 media, 2 alta
  readonly stars: number;
  readonly glow: number;
  readonly autoRotate: boolean;
  readonly fov: number;
  readonly spin: number;
}

export interface CameraState {
  theta: number;
  phi: number;
  dist: number;
}

interface Props {
  readonly settings: SimSettings;
  readonly camera: RefObject<CameraState>;
  readonly onFps?: (fps: number) => void;
  readonly webglUnsupportedMessage: string;
}

const QUALITY = [
  { scale: 0.7, steps: 350 },  // Baja
  { scale: 1.0, steps: 550 },  // Media
  { scale: 1.0, steps: 800 },  // Alta (optimizado a 800 para 60 FPS estables)
];

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
  }
  return s;
}

export default function BlackHole({ settings, camera, onFps, webglUnsupportedMessage }: Readonly<Props>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "high-performance" });
    if (!gl) {
      alert(webglUnsupportedMessage);
      return;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, vertexShader));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, fragmentShader));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const U = {
      res: u("uRes"), time: u("uTime"), camPos: u("uCamPos"), fwd: u("uCamFwd"),
      right: u("uCamRight"), up: u("uCamUp"), fov: u("uFov"),
      intensity: u("uIntensity"), speed: u("uDiskSpeed"), steps: u("uSteps"),
      stars: u("uStars"), glow: u("uGlow"), spin: u("uSpin"), quality: u("uQuality"),
    };

    let raf = 0;
    const start = performance.now();
    let last = start;
    let frames = 0;
    let fpsTime = start;

    const render = (now: number) => {
      const s = settingsRef.current;
      const q = QUALITY[s.quality];
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(canvas.clientWidth * dpr * q.scale);
      const h = Math.floor(canvas.clientHeight * dpr * q.scale);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);

      const dt = (now - last) / 1000;
      last = now;
      const cam = camera.current;
      if (s.autoRotate) cam.theta += dt * 0.04;

      const cp = Math.cos(cam.phi), sp = Math.sin(cam.phi);
      const pos = [cam.dist * cp * Math.cos(cam.theta), cam.dist * sp, cam.dist * cp * Math.sin(cam.theta)];
      const len = Math.hypot(...pos);
      const f = pos.map((v) => -v / len);
      // right = normalize(cross(f, worldUp))
      let r = [f[1] * 0 - f[2] * 1, f[2] * 0 - f[0] * 0, f[0] * 1 - f[1] * 0];
      const rl = Math.hypot(...r) || 1;
      r = r.map((v) => v / rl);
      // up = cross(right, f)
      const up = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
      // Ligera inclinacion (roll) cinematografica
      const roll = 0.06;
      const cr = Math.cos(roll), sr = Math.sin(roll);
      const r2 = r.map((v, i) => v * cr + up[i] * sr);
      const up2 = up.map((v, i) => v * cr - r[i] * sr);

      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.time, (now - start) / 1000);
      gl.uniform3fv(U.camPos, pos);
      gl.uniform3fv(U.fwd, f);
      gl.uniform3fv(U.right, r2);
      gl.uniform3fv(U.up, up2);
      gl.uniform1f(U.fov, s.fov);
      gl.uniform1f(U.intensity, s.intensity);
      gl.uniform1f(U.speed, s.diskSpeed);
      gl.uniform1f(U.steps, q.steps);
      gl.uniform1f(U.stars, s.stars);
      gl.uniform1f(U.glow, s.glow);
      gl.uniform1f(U.spin, s.spin);
      gl.uniform1f(U.quality, s.quality);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      frames++;
      if (now - fpsTime > 500) {
        onFps?.(Math.round((frames * 1000) / (now - fpsTime)));
        frames = 0;
        fpsTime = now;
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    // Controles de camara
    let dragging = false;
    let lx = 0, ly = 0;
    let pinch = 0;
    const down = (e: PointerEvent) => {
      dragging = true; lx = e.clientX; ly = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const cam = camera.current;
      cam.theta -= (e.clientX - lx) * 0.005;
      cam.phi = Math.max(-1.45, Math.min(1.45, cam.phi + (e.clientY - ly) * 0.004));
      lx = e.clientX; ly = e.clientY;
    };
    const up = () => { dragging = false; };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const cam = camera.current;
      cam.dist = Math.max(4, Math.min(60, cam.dist * (1 + e.deltaY * 0.001)));
    };
    const touchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        if (pinch) {
          const cam = camera.current;
          cam.dist = Math.max(4, Math.min(60, cam.dist * (pinch / d)));
        }
        pinch = d;
      }
    };
    const touchEnd = () => { pinch = 0; };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("wheel", wheel, { passive: false });
    canvas.addEventListener("touchmove", touchMove);
    canvas.addEventListener("touchend", touchEnd);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("wheel", wheel);
      canvas.removeEventListener("touchmove", touchMove);
      canvas.removeEventListener("touchend", touchEnd);
    };
  }, [camera, onFps]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
      style={{ imageRendering: "auto" }}
    />
  );
}
