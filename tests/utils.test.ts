import { describe, expect, it } from "vitest";
import { cn } from "../src/utils/cn";
import { fragmentShader, vertexShader } from "../src/shaders";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("px-2 py-1", "bg-red-500")).toBe("px-2 py-1 bg-red-500");
  });

  it("handles conditional class names", () => {
    expect(cn("px-2", false && "py-1", "bg-blue-500")).toBe("px-2 bg-blue-500");
  });
});

describe("shaders", () => {
  it("exports valid vertex and fragment shaders", () => {
    expect(vertexShader).toContain("void main()");
    expect(fragmentShader).toContain("precision highp float;");
  });

  it("implements 3D volumetric raymarching for Alta mode and MHD for Media mode", () => {
    expect(fragmentShader).toContain("float diskHeight(float r, float rPlus)");
    expect(fragmentShader).toContain("vec4 sampleDiskVolume(");
    expect(fragmentShader).toContain("vec4 sampleDiskMHD(");
    expect(fragmentShader).toContain("vec4 sampleDisk(");
    expect(fragmentShader).toContain("exp(-2.5 * yNorm * yNorm)");
    expect(fragmentShader).toContain("pos.y * 3.5");
    expect(fragmentShader).toContain("pos.y * 5.0");
    expect(fragmentShader).toContain("float rho = 7.0 * rhoVertical * bright;");
    expect(fragmentShader).toContain("float dTau = rho * dt;");
    expect(fragmentShader).toContain("vec3 stepEmit = col * rho * boost * uIntensity * ringBoost * 2.0;");
    expect(fragmentShader).toContain("pos.y * nextPos.y < 0.0 && r < DISK_OUT");
  });
});
