import { describe, expect, it } from "vitest";
import { M, type Vec3, cameraTetrad, iscoEnergyMomentum, ksMetric, rIsco, rPlus } from "../src/physics/kerr";

type Vec4 = number[];
const dot = (g: number[][], u: Vec4, v: Vec4) => g.reduce((s, row, i) => s + row.reduce((t, gij, j) => t + gij * u[i] * v[j], 0), 0);

// Inversa 4x4 por Gauss-Jordan
function inverse(m: number[][]): number[][] {
  const a = m.map((row, i) => [...row, ...row.map((_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < 4; c++) {
    const p = a.reduce((best, row, r) => (r >= c && Math.abs(row[c]) > Math.abs(a[best][c]) ? r : best), c);
    [a[c], a[p]] = [a[p], a[c]];
    const d = a[c][c];
    a[c] = a[c].map((v) => v / d);
    for (let r = 0; r < 4; r++) if (r !== c) a[r] = a[r].map((v, j) => v - a[r][c] * a[c][j]);
  }
  return a.map((row) => row.slice(4));
}

describe("kerr horizon and ISCO", () => {
  it("matches known values", () => {
    expect(rPlus(0)).toBeCloseTo(1, 10);
    expect(rPlus(0.85)).toBeCloseTo(0.7634, 4);
    expect(rIsco(0)).toBeCloseTo(3, 10);
    expect(rIsco(0.85)).toBeCloseTo(1.3161, 3);
    expect(rIsco(0.95)).toBeLessThan(rIsco(0.85));
  });

  it("E, L at the ISCO make it a marginally stable circular orbit", () => {
    const { E, L } = iscoEnergyMomentum(0);
    expect(E).toBeCloseTo(Math.sqrt(8 / 9), 10);
    expect(L).toBeCloseTo(Math.sqrt(12) * M, 10);
    for (const spin of [0.3, 0.85, 0.95]) {
      const a = spin * M, r0 = rIsco(spin), { E, L } = iscoEnergyMomentum(spin);
      // Potencial radial ecuatorial R(r) = (u^r)^2 r^4: R = R' = R'' = 0 en el ISCO
      const R = (r: number) => (E * (r * r + a * a) - a * L) ** 2 - (r * r - 2 * M * r + a * a) * (r * r + (L - a * E) ** 2);
      const h = 1e-3;
      expect(Math.abs(R(r0))).toBeLessThan(1e-9);
      expect(Math.abs((R(r0 + h) - R(r0 - h)) / (2 * h))).toBeLessThan(1e-6);
      expect(Math.abs((R(r0 + h) - 2 * R(r0) + R(r0 - h)) / (h * h))).toBeLessThan(1e-4);
    }
  });
});

describe("Kerr-Schild metric", () => {
  it("is flat far away and has the horizon where g^rr vanishes", () => {
    const g = ksMetric([0, 0, 1e7], 0.85);
    expect(g[0][0]).toBeCloseTo(-1, 6);
    expect(g[3][3]).toBeCloseTo(1, 6);
    // Normal al horizonte: g^{mu nu} dr dr = 0 en r+ (ecuador: r^2 = x^2 + z^2 - a^2)
    const a = 0.85 * M, r = rPlus(0.85), R = Math.sqrt(r * r + a * a);
    const gi = inverse(ksMetric([R, 0, 0], 0.85));
    const e = 1e-6, rOf = (x: number, z: number) => Math.sqrt(x * x + z * z - a * a);
    const dr = [0, (rOf(R + e, 0) - rOf(R - e, 0)) / (2 * e), 0, (rOf(R, e) - rOf(R, -e)) / (2 * e)];
    expect(Math.abs(dot(gi, dr, dr))).toBeLessThan(1e-6);
  });

  it("drags frames prograde about +y", () => {
    // g_t_phi < 0 con d/dphi = z d/dx - x d/dz (giro de +z hacia +x)
    const g = ksMetric([0, 0, 3], 0.85);
    expect(g[0][1] * 3).toBeLessThan(0);
  });
});

describe("camera tetrad", () => {
  const pos: Vec3 = [3.2, 2.1, -1.4];
  const n = Math.hypot(...pos);
  const fwd = pos.map((v) => -v / n) as Vec3;
  const t = cameraTetrad(pos, fwd, [0.4, 0, 0.9], [0, 1, 0], 0.95);
  const g = ksMetric(pos, 0.95);
  const gi = inverse(g);
  const raise = (p: Vec4) => gi.map((row) => row.reduce((s, v, j) => s + v * p[j], 0));
  const covU: Vec4 = [t.pt, ...t.u.map((v) => -v)];
  const legs = [t.fwd, t.right, t.up].map((l) => [0, ...l]);

  it("is orthonormal under g", () => {
    const vecs = [covU, ...legs].map(raise);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      expect(dot(g, vecs[i], vecs[j])).toBeCloseTo(i === j ? (i === 0 ? -1 : 1) : 0, 10);
    }
  });

  it("gives null pixel rays with p.U = -1 and the static blueshift", () => {
    for (const [ux, uy] of [[0, 0], [0.3, -0.2], [-1, 0.7]]) {
      const k = Math.hypot(1.3, ux, uy);
      const nl = [0, 1, 2].map((i) => (1.3 * t.fwd[i] + ux * t.right[i] + uy * t.up[i]) / k);
      // Momento del foton fisico (p_t, -p) con p = uCamU + n
      const p: Vec4 = [t.pt, ...nl.map((v, i) => -(t.u[i] + v))];
      expect(dot(gi, p, p)).toBeCloseTo(0, 10);
      expect(dot(gi, p, covU)).toBeCloseTo(-1, 10);
    }
    expect(t.pt).toBeCloseTo(-Math.sqrt(-g[0][0]), 12);
  });
});

describe("shadow of Kerr (exact geodesics from the tetrad)", () => {
  // Integrador minimo de referencia: H = 1/2 g^{mu nu} p p con gradiente numerico, RK4 hacia atras
  function captured(spin: number, D: number, bx: number): boolean {
    const pos: Vec3 = [D, 0, 0];
    const t = cameraTetrad(pos, [-1, 0, 0], [0, 0, -1], [0, 1, 0], spin);
    const k = Math.hypot(D, bx);
    let x = [...pos];
    let p = [t.pt, ...[0, 1, 2].map((i) => -(t.u[i] + (D * t.fwd[i] + bx * t.right[i]) / k))];
    const H = (x: number[], p: Vec4) => 0.5 * dot(inverse(ksMetric(x as Vec3, spin)), p, p);
    const rhs = (x: number[], p: Vec4) => {
      const gi = inverse(ksMetric(x as Vec3, spin));
      const dx = gi.map((row) => row.reduce((s, v, j) => s + v * p[j], 0)).slice(1);
      const dp = [0, ...[0, 1, 2].map((i) => {
        const e = 1e-6 * Math.max(1, Math.hypot(...x));
        const xp = [...x], xm = [...x];
        xp[i] += e; xm[i] -= e;
        return -(H(xp, p) - H(xm, p)) / (2 * e);
      })];
      return { dx, dp };
    };
    const rh = rPlus(spin), a = spin * M;
    for (let i = 0; i < 20000; i++) {
      const b = x[0] ** 2 + x[1] ** 2 + x[2] ** 2 - a * a;
      const r = Math.sqrt(0.5 * (b + Math.sqrt(b * b + 4 * a * a * x[1] ** 2)));
      if (r < rh * 1.01) return true;
      if (r > D * 1.01) return false;
      // Hacia atras en el parametro afin del foton fisico
      const h = -Math.min(0.01 * (r - rh) + 0.002, 0.02 * r);
      const add = (k: { dx: number[]; dp: Vec4 }, c: number) => [x.map((v, j) => v + c * k.dx[j]), p.map((v, j) => v + c * k.dp[j])];
      const k1 = rhs(x, p);
      const [x2, p2] = add(k1, h / 2), k2 = rhs(x2, p2);
      const [x3, p3] = add(k2, h / 2), k3 = rhs(x3, p3);
      const [x4, p4] = add(k3, h), k4 = rhs(x4, p4);
      x = x.map((v, j) => v + (h / 6) * (k1.dx[j] + 2 * k2.dx[j] + 2 * k3.dx[j] + k4.dx[j]));
      p = p.map((v, j) => v + (h / 6) * (k1.dp[j] + 2 * k2.dp[j] + 2 * k3.dp[j] + k4.dp[j]));
    }
    throw new Error("rayo sin terminar");
  }
  // Borde de la sombra en unidades de parametro de impacto (fov = D): bx < 0 es +z, lado progrado
  const edge = (spin: number, side: number) => {
    let lo = 0.5, hi = 4.5;
    for (let i = 0; i < 10; i++) {
      const m = (lo + hi) / 2;
      if (captured(spin, 200, side * m)) lo = m;
      else hi = m;
    }
    return (lo + hi) / 2;
  };

  it("is the Schwarzschild circle at spin 0 and a flattened D on the prograde side", () => {
    expect(edge(0, 1)).toBeCloseTo(Math.sqrt(27) / 2, 1);
    expect(edge(0.85, -1)).toBeCloseTo(1.53, 1);
    expect(edge(0.85, 1)).toBeCloseTo(3.371, 1);
  }, 60000);
});
