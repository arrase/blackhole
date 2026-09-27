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
    expect(fragmentShader).not.toContain("pos.y * 3.5");
    expect(fragmentShader).not.toContain("pos.y * 5.0");
    expect(fragmentShader).toContain("float rho = 7.0 * rhoVertical * bright;");
    expect(fragmentShader).toContain("float dTau = min(rho * dt * 0.70, 0.25);");
    expect(fragmentShader).toContain("vec3 stepEmit = col * rho * boost * uIntensity * ringBoost * 2.2;");
    expect(fragmentShader).toContain("pos.y * nextPos.y < 0.0 && r < DISK_OUT");
  });

  it("implements Planckian blackbody radiation and physically based relativistic temperature with thermal floor", () => {
    expect(fragmentShader).toContain("vec3 planckBlackbody(float T)");
    expect(fragmentShader).toContain("vec3 c2_lambda = vec3(22.13, 26.64, 31.97);");
    expect(fragmentShader).toContain("tEmit = 7.5 * tempNorm;");
    expect(fragmentShader).toContain("tEmit = 3.6 * pow(max(r - rPlus, 0.0) / max(rIsco - rPlus, 0.001), 0.5);");
    expect(fragmentShader).toContain("float tLocal = tEmit * (0.8 + 0.45 * filament + 0.3 * shock);");
    expect(fragmentShader).toContain("float tObs = max(tLocal * pow(shift, 0.65), 2.6);");
    expect(fragmentShader).toContain("boost = max(boost, 0.42);");
    expect(fragmentShader).toContain("vec3 col = planckBlackbody(tObs);");
    expect(fragmentShader).not.toContain("colCrimson");
    expect(fragmentShader).not.toContain("colAmber");
    // Baja mode remains intact
    expect(fragmentShader).toContain("vec3 cold = vec3(0.72, 0.15, 0.02);");
  });

  it("isolates the galactic nebula to the galactic plane with continuous Gaussian falloff", () => {
    expect(fragmentShader).toContain("vec3 gAxis = normalize(vec3(0.82, 0.38, 0.42));");
    expect(fragmentShader).toContain("float galBand = exp(-pow(dot(d, gAxis) * 3.0, 2.0));");
    expect(fragmentShader).toContain("float galCore = exp(-pow(dot(d, gAxis) * 1.8, 2.0));");
    expect(fragmentShader).toContain("float rifts = smoothstep(0.22, 0.65, dust1 * dust2);");
    expect(fragmentShader).toContain("vec3 nebula = pow(galBand, 1.6) * (1.0 - rifts * 0.82) * emissionCol * 1.5;");
    expect(fragmentShader).not.toContain("galMask");
  });
});
