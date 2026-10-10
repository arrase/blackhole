import { describe, expect, it } from "vitest";
import { cameraBasis } from "../src/render/camera";
import { halton, subpixelJitter } from "../src/render/halton";
import { generateNoise } from "../src/render/noiseTexture";
import { AdaptiveScaler } from "../src/render/scaler";
import { SHUTTER, blendWeight, historyKey, sameKey } from "../src/render/temporal";
import type { SimSettings } from "../src/render/types";

const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);

describe("halton", () => {
  it("matches the radical inverse in bases 2 and 3", () => {
    expect([1, 2, 3, 4].map((i) => halton(i, 2))).toEqual([0.5, 0.25, 0.75, 0.125]);
    expect(halton(1, 3)).toBeCloseTo(1 / 3);
    expect(halton(5, 3)).toBeCloseTo(7 / 9);
  });

  it("jitter stays within the pixel, cycles, and averages to the center", () => {
    const pts = Array.from({ length: 16 }, (_, f) => subpixelJitter(f));
    for (const [x, y] of pts) {
      expect(Math.abs(x)).toBeLessThan(0.5);
      expect(Math.abs(y)).toBeLessThan(0.5);
    }
    expect(subpixelJitter(16)).toEqual(pts[0]);
    expect(Math.abs(pts.reduce((s, p) => s + p[0], 0) / 16)).toBeLessThan(0.05);
    expect(Math.abs(pts.reduce((s, p) => s + p[1], 0) / 16)).toBeLessThan(0.05);
  });
});

describe("noise texture", () => {
  it("is deterministic, full size and roughly uniform with mean 0.5", () => {
    const a = generateNoise(16);
    expect(a.length).toBe(16 ** 3);
    expect(generateNoise(16)).toEqual(a);
    expect(generateNoise(16, 2)).not.toEqual(a);
    const mean = a.reduce((s, v) => s + v, 0) / a.length / 255;
    expect(mean).toBeGreaterThan(0.47);
    expect(mean).toBeLessThan(0.53);
    const hist = new Array(4).fill(0);
    for (const v of a) hist[v >> 6]++;
    for (const n of hist) expect(n / a.length).toBeCloseTo(0.25, 1);
  });
});

describe("temporal accumulation", () => {
  it("averages cumulatively after a reset, then bounds the window to the shutter while moving", () => {
    expect(blendWeight(0, 1 / 60, true)).toBe(1);
    expect(blendWeight(1, 1 / 60, true)).toBe(0.5);
    const w = blendWeight(100, 1 / 60, true);
    // Edad media de la historia = medio obturador
    expect(((1 - w) / w) * (1 / 60)).toBeCloseTo(SHUTTER / 2);
    expect(blendWeight(100, 1, true)).toBeGreaterThan(0.9);
  });

  it("keeps averaging without bound in a static scene so noise converges", () => {
    expect(blendWeight(100, 1 / 60, false)).toBe(1 / 101);
  });

  const settings: SimSettings = {
    intensity: 0.35, diskSpeed: 1.5, diskTemp: 1.75, stars: 1, glow: 0.6,
    autoRotate: true, fov: 1.3, spin: 0.85, accretionDisk: true,
  };
  const cam = { theta: 1.2, phi: 0.12, dist: 22 };

  it("keeps history under theta orbit, gas clock rate and post-only settings", () => {
    const k = historyKey(cam, settings);
    const same = { ...settings, diskSpeed: 0, intensity: 2, glow: 0, autoRotate: false };
    expect(sameKey(k, historyKey({ ...cam, theta: 2 }, same))).toBe(true);
  });

  it("resets on phi, distance, fov, spin and scene settings", () => {
    const k = historyKey(cam, settings);
    const changed = [
      historyKey({ ...cam, phi: 0.2 }, settings),
      historyKey({ ...cam, dist: 21 }, settings),
      ...(["fov", "spin", "diskTemp", "stars"] as const).map((f) =>
        historyKey(cam, { ...settings, [f]: settings[f] + 0.1 })),
      historyKey(cam, { ...settings, accretionDisk: false }),
    ];
    for (const c of changed) expect(sameKey(k, c)).toBe(false);
  });
});

describe("adaptive scaler", () => {
  const opts = { targetMs: 13, minScale: 0.35, maxScale: 1 };
  const feed = (s: AdaptiveScaler, cost: (scale: number) => number, n: number) => {
    for (let i = 0; i < n; i++) s.update(cost(s.scale));
  };

  it("converges to the scale whose cost meets the target (cost ~ scale^2)", () => {
    const s = new AdaptiveScaler(opts);
    feed(s, (k) => 40 * k * k, 2000);
    const ideal = Math.sqrt(13 / 40);
    expect(s.scale).toBeGreaterThan(ideal - 0.1);
    expect(s.scale).toBeLessThanOrEqual(ideal + 0.05);
  });

  it("is quantized and does not oscillate inside the hysteresis band", () => {
    const s = new AdaptiveScaler(opts);
    feed(s, (k) => 40 * k * k, 2000);
    let changes = 0;
    for (let i = 0; i < 2000; i++) if (s.update(40 * s.scale * s.scale)) changes++;
    expect(changes).toBeLessThan(10);
    expect(Math.abs(s.scale / 0.05 - Math.round(s.scale / 0.05))).toBeLessThan(1e-9);
  });

  it("respects caps and recovers when load drops", () => {
    const s = new AdaptiveScaler(opts);
    feed(s, () => 200, 500);
    expect(s.scale).toBe(0.35);
    feed(s, (k) => 4 * k * k, 500);
    expect(s.scale).toBe(1);
    s.configure({ ...opts, maxScale: 0.7 });
    expect(s.scale).toBe(0.7);
  });

  it("probes upward when frame time is pinned at vsync", () => {
    const s = new AdaptiveScaler({ targetMs: 1000 / 60, minScale: 0.35, maxScale: 1 });
    feed(s, () => 30, 200);
    const low = s.scale;
    feed(s, () => 1000 / 60, 1000);
    expect(s.scale).toBeGreaterThan(low);
  });

  it("ignores hidden-tab spikes", () => {
    const s = new AdaptiveScaler(opts);
    for (let i = 0; i < 100; i++) s.update(i % 10 === 0 ? 5000 : 10);
    expect(s.scale).toBe(1);
  });
});

describe("camera", () => {
  it("builds an orthonormal basis looking at the origin", () => {
    const b = cameraBasis({ theta: 0.6, phi: 0.14, dist: 9 });
    expect(Math.hypot(...b.pos)).toBeCloseTo(9);
    for (const v of [b.fwd, b.right, b.up]) expect(Math.hypot(...v)).toBeCloseTo(1);
    expect(dot(b.fwd, b.right)).toBeCloseTo(0);
    expect(dot(b.fwd, b.up)).toBeCloseTo(0);
    expect(dot(b.right, b.up)).toBeCloseTo(0);
    expect(dot(b.fwd, b.pos.map((v) => -v / 9))).toBeCloseTo(1);
  });
});
