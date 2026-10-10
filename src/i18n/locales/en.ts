import type { Translation } from "../types";

export const en: Translation = {
  "title": "Gargantua · Black Hole Simulation",
  "subtitle": "Supermassive black hole · Real-time relativistic simulation",
  "presets": {
    "cine": "Interstellar View",
    "kerr": "Kerr Shadow",
    "cerca": "Close Approach",
    "arriba": "Top-Down View",
    "plano": "Disk Plane"
  },
  "hud": "Drag to orbit · Scroll to zoom",
  "webglUnsupported": "Your browser does not support WebGL",
  "buttons": {
    "info": "What am I seeing?",
    "hideControls": "Hide controls",
    "showControls": "Controls",
    "close": "Close"
  },
  "controls": {
    "spin": "Rotation (Kerr Spin)",
    "intensity": "Disk Brightness",
    "diskSpeed": "Disk Speed",
    "diskTemp": "Disk Temperature",
    "glow": "Lens Glow",
    "stars": "Stars",
    "fov": "Lens Zoom",
    "autoRotate": "Auto Rotation",
    "accretionDisk": "Accretion Disk"
  },
  "info": {
    "title": "THE PHYSICS BEHIND IT",
    "metricTitle": "Kerr Metric and Spin: ",
    "metricDesc": "simulates a black hole with relativistic rotation. Spin drags the very fabric of spacetime (Lense-Thirring effect / frame dragging), flattening the shadow on the side rotating toward us into a characteristic \"D\"-shaped silhouette.",
    "horizonTitle": "Horizon and Ergosphere: ",
    "horizonDesc": "the event horizon contracts with spin according to r+ = M + √(M²-a²). Outside lies the ergosphere, where frame dragging forces all matter to orbit in the direction of rotation.",
    "iscoTitle": "Innermost Stable Circular Orbit (ISCO): ",
    "iscoDesc": "calculated using the Bardeen-Press-Teukolsky formula. As spin increases to 0.95, the inner disk edge moves from 3.0 down to 0.97, allowing gas to plunge much deeper and release tremendous gravitational energy.",
    "lensingTitle": "Gravitational Lensing & Photon Ring: ",
    "lensingDesc": "each light ray is traced backwards along an exact Kerr null geodesic (Kerr-Schild coordinates): the disk shows above and below the shadow, and its higher-order images form the thin photon ring.",
    "dopplerTitle": "Doppler Effect and Beaming: ",
    "dopplerDesc": "the light we see is a blackbody at g·T, where g combines the Doppler shift and gravitational redshift (bolometric intensity ∝ g⁴): the side moving toward us looks brighter and whiter, the receding side dimmer and redder."
  }
};
