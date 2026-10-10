import { describe, expect, it } from "vitest";
import { DISK_BRIGHTNESS, T_UNIT, diskParams, dopplerMax, fluxPeak, keplerOmega, pageThorneFlux } from "../src/physics/disk";
import { M, iscoEnergyMomentum, rIsco } from "../src/physics/kerr";
import { blackbody, luminance } from "../src/physics/color";

// Energia y momento angular de la orbita circular prograda de radio r (Bardeen-Press-Teukolsky)
function circular(r: number, spin: number) {
  const a = spin * M, sr = Math.sqrt(r), sm = Math.sqrt(M);
  const den = r ** 0.75 * Math.sqrt(r * sr - 3 * M * sr + 2 * a * sm);
  return { E: (r * sr - 2 * M * sr + a * sm) / den, L: (sm * (r * r - 2 * a * sm * sr + a * a)) / den, W: keplerOmega(r, spin) };
}

describe("Page-Thorne flux", () => {
  it("vanishes at the ISCO and tends to the Newtonian 3 Mdot M / (8 pi r^3) far away", () => {
    for (const spin of [0, 0.5, 0.95]) {
      expect(pageThorneFlux(rIsco(spin), spin)).toBe(0);
      expect(pageThorneFlux(rIsco(spin) * 1.001, spin)).toBeGreaterThan(0);
      const r = 1e6;
      expect(pageThorneFlux(r, spin) * (r / M) ** 3).toBeCloseTo(1, 2);
    }
  });

  it("matches the conservation-law integral F ∝ -W' / (E - W L)^2 / r * int (E - W L) L' dr", () => {
    for (const spin of [0, 0.5, 0.95]) {
      const r0 = rIsco(spin), h = 1e-5;
      const d = (f: (r: number) => number, r: number) => (f(r + h) - f(r - h)) / (2 * h);
      const integrand = (r: number) => {
        const c = circular(r, spin);
        return (c.E - c.W * c.L) * d((s) => circular(s, spin).L, r);
      };
      const ratios = [1.2, 1.5, 2, 4].map((k) => {
        const r = r0 * k, n = 4000;
        let I = 0;
        for (let i = 0; i < n; i++) I += integrand(r0 + ((i + 0.5) * (r - r0)) / n) * ((r - r0) / n);
        const c = circular(r, spin);
        const F = (-d((s) => keplerOmega(s, spin), r) / (c.E - c.W * c.L) ** 2) * (I / r);
        return pageThorneFlux(r, spin) / F;
      });
      for (const q of ratios) expect(q / ratios[0]).toBeCloseTo(1, 3);
    }
  });

  it("peaks at r = 9.55 M for Schwarzschild and runs ~2x hotter at spin 0.85", () => {
    expect(fluxPeak(0).r / M).toBeCloseTo(9.55, 1);
    expect((fluxPeak(0.85).F / fluxPeak(0).F) ** 0.25).toBeCloseTo(1.99, 1);
  });
});

describe("plunging gas", () => {
  it("(u^r)^2 = (1 - E^2)(r_isco / r - 1)^3 is the equatorial radial potential for the ISCO orbit", () => {
    for (const spin of [0, 0.85, 0.95]) {
      const a = spin * M, r0 = rIsco(spin), { E, L } = iscoEnergyMomentum(spin);
      for (const k of [0.95, 0.8, 0.6]) {
        const r = r0 * k;
        const R = (E * (r * r + a * a) - a * L) ** 2 - (r * r - 2 * M * r + a * a) * (r * r + (L - a * E) ** 2);
        expect((1 - E * E) * (r0 / r - 1) ** 3).toBeCloseTo(R / r ** 4, 10);
      }
    }
  });

  it("leaves the ISCO with the Keplerian angular velocity (continuous kinematics)", () => {
    for (const spin of [0, 0.85]) {
      const a = spin * M, r = rIsco(spin), { E, L } = iscoEnergyMomentum(spin), delta = r * r - 2 * M * r + a * a;
      const uphi = (L * (1 - (2 * M) / r) + (2 * M * a * E) / r) / delta;
      const ut = ((r * r + a * a + (2 * M * a * a) / r) * E - (2 * M * a * L) / r) / delta;
      expect(uphi / ut).toBeCloseTo(keplerOmega(r, spin), 10);
    }
  });
});

describe("disk parameters", () => {
  it("meters the forward-emitted photons of a circular orbit (Schwarzschild closed form)", () => {
    for (const r of [3, 4.7755, 10]) {
      const exact = Math.sqrt(1 - (3 * M) / r) / (1 - Math.sqrt(M / r) / Math.sqrt(1 - (2 * M) / r));
      expect(dopplerMax(r, 0)).toBeCloseTo(exact, 10);
    }
    expect(dopplerMax(fluxPeak(0.85).r, 0.85)).toBeCloseTo(1.437, 3);
  });

  it("diskTemp sets the Schwarzschild peak temperature and the radiance unit meters it", () => {
    const p0 = diskParams(0, 1.75);
    expect(p0.tPeak).toBeCloseTo(1.75 * T_UNIT, 10);
    const p = diskParams(0.85, 1.75);
    expect(p.tPeak / p0.tPeak).toBeCloseTo(1.99, 1);
    expect(p.unit * luminance(blackbody(p.tPeak * dopplerMax(fluxPeak(0.85).r, 0.85)))).toBeCloseTo(DISK_BRIGHTNESS, 10);
    expect(p.flowPeriod).toBeCloseTo(Math.PI / keplerOmega(fluxPeak(0.85).r, 0.85), 10);
  });
});

describe("blackbody fit", () => {
  // Referencia: Planck integrado con el ajuste multilobulo de CIE 1931 (Wyman-Sloan-Shirley 2013)
  const g = (x: number, m: number, s1: number, s2: number) => Math.exp(-0.5 * ((x - m) * (x < m ? s1 : s2)) ** 2);
  const xb = (l: number) => 1.056 * g(l, 599.8, 0.0264, 0.0323) + 0.362 * g(l, 442.0, 0.0624, 0.0374) - 0.065 * g(l, 501.1, 0.049, 0.0382);
  const yb = (l: number) => 0.821 * g(l, 568.8, 0.0213, 0.0247) + 0.286 * g(l, 530.9, 0.0613, 0.0322);
  const zb = (l: number) => 1.217 * g(l, 437.0, 0.0845, 0.0278) + 0.681 * g(l, 459.0, 0.0385, 0.0725);
  function cie(T: number): number[] {
    let X = 0, Y = 0, Z = 0;
    for (let l = 380; l <= 780; l += 1) {
      const B = 1 / (l ** 5 * Math.expm1(1.4388e7 / (l * T * 1000)));
      X += B * xb(l);
      Y += B * yb(l);
      Z += B * zb(l);
    }
    return [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z];
  }

  it("has unit luminance at 6.5 kK", () => {
    expect(luminance(blackbody(6.5))).toBeCloseTo(1, 2);
  });

  it("matches the CIE-integrated color within 5 % of the largest channel and luminance within 4 %", () => {
    const ref = luminance(cie(6.5));
    for (const T of [2, 4, 6.5, 10, 20]) {
      const fit = blackbody(T), c = cie(T), yf = luminance(fit), yc = luminance(c) / ref;
      expect(Math.abs(yf / yc - 1)).toBeLessThan(0.04);
      for (let i = 0; i < 3; i++) expect(Math.abs(fit[i] / yf - c[i] / ref / yc)).toBeLessThan((0.05 * Math.max(...c)) / ref / yc);
    }
  });
});
