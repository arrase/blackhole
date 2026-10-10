import type { CameraState, SimSettings } from "./types";

// Obturador equivalente de la acumulacion (s): con el disco animado o la camara orbitando, la
// historia se convierte en desenfoque de movimiento de cine en vez de estelas sin limite
export const SHUTTER = 1 / 12;

// Peso del frame nuevo en la media exponencial: media acumulativa 1/(n+1) tras un reinicio. Si la
// imagen se mueve (moving), acotada para que la edad media de la historia, (1-w)/w*dt, sea SHUTTER/2
// como en un obturador de caja; quieta, la media sigue acumulando y el ruido converge
export function blendWeight(samples: number, dt: number, moving: boolean): number {
  const cumulative = 1 / (samples + 1);
  return moving ? Math.max(cumulative, 1 / (1 + SHUTTER / (2 * dt))) : cumulative;
}

// Todo lo que cambia la imagen del raymarch de forma discontinua. Quedan fuera los movimientos
// continuos, que la historia vuelve desenfoque legitimo: theta (orbitar alrededor del eje de giro, y,
// solo desplaza el contenido como una rotacion del disco) y el reloj del gas (diskSpeed solo cambia su
// ritmo). Intensidad y brillo solo afectan al post.
export function historyKey(cam: CameraState, s: SimSettings): number[] {
  return [cam.phi, cam.dist, s.fov, s.spin, s.diskTemp, s.stars, s.accretionDisk ? 1 : 0];
}

export function sameKey(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
