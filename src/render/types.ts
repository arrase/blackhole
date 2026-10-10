export interface SimSettings {
  readonly intensity: number;
  readonly diskSpeed: number;
  readonly diskTemp: number;
  readonly stars: number;
  readonly glow: number;
  readonly autoRotate: boolean;
  readonly fov: number;
  readonly spin: number;
  readonly accretionDisk: boolean;
}

export interface CameraState {
  theta: number;
  phi: number;
  dist: number;
}
