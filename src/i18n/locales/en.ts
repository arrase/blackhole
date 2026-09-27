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
    "quality": "Quality",
    "qualityLevels": [
      "Low",
      "Medium",
      "High"
    ],
    "spin": "Rotation (Kerr Spin)",
    "intensity": "Disk Brightness",
    "diskSpeed": "Disk Speed",
    "glow": "Photon Ring",
    "stars": "Stars",
    "fov": "Lens Zoom",
    "autoRotate": "Auto Rotation"
  },
  "info": {
    "title": "THE PHYSICS BEHIND IT",
    "metricTitle": "Kerr Metric and Spin: ",
    "metricDesc": "simulates a black hole with relativistic rotation. Spin drags the very fabric of spacetime (Lense-Thirring effect / frame dragging), flattening the shadow on the side rotating toward us into a characteristic \"D\"-shaped silhouette.",
    "horizonTitle": "Horizon and Ergosphere: ",
    "horizonDesc": "the event horizon contracts with spin according to r+ = M + √(M²-a²). Outside lies the ergosphere, where frame dragging forces all matter to orbit in the direction of rotation.",
    "iscoTitle": "Innermost Stable Circular Orbit (ISCO): ",
    "iscoDesc": "calculated using the Bardeen-Press-Teukolsky formula. As spin increases to 0.95, the inner disk edge moves from 3.0 down to 0.95, allowing gas to plunge much deeper and release tremendous gravitational energy.",
    "lensingTitle": "Gravitational Lensing & Photon Ring: ",
    "lensingDesc": "each light ray follows null geodesics integrated with 2nd-order symplectic Verlet accounting for gravitomagnetic acceleration.",
    "dopplerTitle": "Doppler Effect and Beaming: ",
    "dopplerDesc": "prograde gas travelling toward the observer experiences strong blueshift and quartic relativistic beaming (δ⁴)."
  }
};
