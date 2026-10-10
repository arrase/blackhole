import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { Renderer } from "./render/renderer";
import { AdaptiveScaler, type ScalerOptions } from "./render/scaler";
import type { CameraState, SimSettings } from "./render/types";

export type { CameraState, SimSettings } from "./render/types";

interface Props {
  readonly settings: SimSettings;
  readonly camera: RefObject<CameraState>;
  readonly onFps?: (fps: number) => void;
  readonly webglUnsupportedMessage: string;
}

// Objetivo de 60 fps. Con tiempo de GPU se deja margen para CPU y composicion; con el intervalo
// de rAF (sujeto a vsync) el objetivo es el propio periodo de frame
const GPU_TARGET_MS = 13;
const FRAME_TARGET_MS = 1000 / 60;
const MIN_SCALE = 0.35;
const MAX_SCALE = 1;

export default function BlackHole({ settings, camera, onFps, webglUnsupportedMessage }: Readonly<Props>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const canvas = canvasRef.current!;
    let renderer = Renderer.create(canvas);
    if (!renderer) {
      alert(webglUnsupportedMessage);
      return;
    }
    const scalerOptions = (): ScalerOptions => ({
      targetMs: renderer!.hasGpuTimer ? GPU_TARGET_MS : FRAME_TARGET_MS,
      minScale: MIN_SCALE,
      maxScale: MAX_SCALE,
    });
    const scaler = new AdaptiveScaler(scalerOptions());

    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let fpsTime = last;

    const render = (now: number) => {
      const r = renderer!;
      const s = settingsRef.current;
      const dt = (now - last) / 1000;
      last = now;
      const cam = camera.current;
      if (s.autoRotate) cam.theta += dt * 0.04;

      const ms = r.hasGpuTimer ? r.pollGpuMs() : dt * 1000;
      if (ms !== null) scaler.update(ms);
      if (ms !== null) (window as unknown as { __perf: number[] }).__perf = [ms, scaler.scale, r.hasGpuTimer ? 1 : 0];

      r.render({ camera: cam, settings: s, dt, scale: scaler.scale });

      frames++;
      if (now - fpsTime > 500) {
        onFps?.(Math.round((frames * 1000) / (now - fpsTime)));
        frames = 0;
        fpsTime = now;
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    // Contexto perdido (reinicio del driver, GPU reclamada): se para el bucle y, al restaurarse, se
    // recrea el renderer; preventDefault pide al navegador que lo restaure
    const contextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      renderer = null;
    };
    const contextRestored = () => {
      renderer = Renderer.create(canvas);
      if (!renderer) {
        alert(webglUnsupportedMessage);
        return;
      }
      scaler.configure(scalerOptions());
      last = performance.now();
      raf = requestAnimationFrame(render);
    };
    canvas.addEventListener("webglcontextlost", contextLost);
    canvas.addEventListener("webglcontextrestored", contextRestored);

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
      renderer?.dispose();
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
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
    />
  );
}
