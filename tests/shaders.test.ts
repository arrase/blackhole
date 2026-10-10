import { describe, expect, it } from "vitest";
import { fullscreenVertex } from "../src/shaders/common";
import { bloomDownFragment, bloomUpFragment, compositeFragment } from "../src/shaders/post";
import { NOISE_SIZE } from "../src/shaders/noise";
import { raymarchFragment } from "../src/shaders/raymarch";

const programs = { fullscreenVertex, raymarchFragment, bloomDownFragment, bloomUpFragment, compositeFragment };

describe("shaders", () => {
  it("are GLSL ES 3.00 programs (WebGL2 only)", () => {
    for (const src of Object.values(programs)) expect(src.startsWith("#version 300 es\n")).toBe(true);
  });

  it("define each function once per program (chunks composed without duplicates)", () => {
    for (const src of Object.values(programs)) {
      const names = [...src.matchAll(/^\w+ (\w+)\([^;{]*\)\s*\{/gm)].map((m) => m[1]);
      expect(names).toContain("main");
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it("gas texture is seamless in azimuth: whole noise periods per turn and integer lacunarity", () => {
    const cells = Number(/const float GAS_CELLS = ([\d.]+);/.exec(raymarchFragment)![1]);
    expect(cells % NOISE_SIZE[0]).toBe(0);
    const lacunarity = Number(/p = p \* ([\d.]+) \+/.exec(raymarchFragment)![1]);
    expect(Number.isInteger(lacunarity)).toBe(true);
  });
});
