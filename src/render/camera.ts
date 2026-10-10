import type { Vec3 } from "../physics/kerr";
import type { CameraState } from "./types";

export interface CameraBasis {
  readonly pos: Vec3;
  readonly fwd: Vec3;
  readonly right: Vec3;
  readonly up: Vec3;
}

// Ligera inclinacion (roll) cinematografica
const ROLL = 0.06;

// Camara orbital mirando al origen; el eje y es el eje de giro del agujero negro. Son direcciones
// de coordenadas: cameraTetrad (physics/kerr.ts) las convierte en la tetrada del observador estatico
export function cameraBasis(cam: CameraState): CameraBasis {
  const cp = Math.cos(cam.phi), sp = Math.sin(cam.phi);
  const pos: Vec3 = [cam.dist * cp * Math.cos(cam.theta), cam.dist * sp, cam.dist * cp * Math.sin(cam.theta)];
  const len = Math.hypot(...pos);
  const f: Vec3 = [-pos[0] / len, -pos[1] / len, -pos[2] / len];
  // right = normalize(cross(f, y)), up = cross(right, f)
  const rl = Math.hypot(f[2], f[0]) || 1;
  const r: Vec3 = [-f[2] / rl, 0, f[0] / rl];
  const u: Vec3 = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const cr = Math.cos(ROLL), sr = Math.sin(ROLL);
  return {
    pos,
    fwd: f,
    right: [r[0] * cr + u[0] * sr, r[1] * cr + u[1] * sr, r[2] * cr + u[2] * sr],
    up: [u[0] * cr - r[0] * sr, u[1] * cr - r[1] * sr, u[2] * cr - r[2] * sr],
  };
}
