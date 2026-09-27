import type { Translation } from "../types";

export const de: Translation = {
  "title": "Gargantua · Schwarzes Loch Simulation",
  "subtitle": "Supermassereiches Schwarzes Loch · Relativistische Echtzeitsimulation",
  "presets": {
    "cine": "Interstellar-Ansicht",
    "kerr": "Kerr-Schatten",
    "cerca": "Annäherung",
    "arriba": "Von oben",
    "plano": "Akkretionsscheibenebene"
  },
  "hud": "Ziehen zum Orbitieren · Scrollen zum Zoomen",
  "webglUnsupported": "Ihr Browser unterstützt kein WebGL",
  "buttons": {
    "info": "Was sehe ich hier?",
    "hideControls": "Steuerung ausblenden",
    "showControls": "Steuerung",
    "close": "Schließen"
  },
  "controls": {
    "quality": "Qualität",
    "qualityLevels": [
      "Niedrig",
      "Mittel",
      "Hoch",
      "Ultra"
    ],
    "spin": "Rotation (Kerr-Spin)",
    "intensity": "Scheibenhelligkeit",
    "diskSpeed": "Scheibengeschwindigkeit",
    "glow": "Photonenring",
    "stars": "Sterne",
    "fov": "Kamerazoom",
    "autoRotate": "Automatische Rotation"
  },
  "info": {
    "title": "DIE PHYSIK DAHINTER",
    "metricTitle": "Kerr-Metrik und Spin: ",
    "metricDesc": "simuliert ein relativistisch rotierendes Schwarzes Loch. Die Drehung zieht die Raumzeit selbst mit (Lense-Thirring-Effekt / Frame-Dragging), wodurch der Schatten auf der auf uns zu rotierenden Seite abgeflacht wird und eine charakteristische D-förmige Silhouette entsteht.",
    "horizonTitle": "Ereignishorizont und Ergosphäre: ",
    "horizonDesc": "der Ereignishorizont schrumpft mit dem Spin gemäß r+ = M + √(M²-a²). Davor entsteht die Ergosphäre, in der das Frame-Dragging jegliche Materie zwingt, in Rotationsrichtung zu kreisen.",
    "iscoTitle": "Innerste stabile Kreisbahn (ISCO): ",
    "iscoDesc": "berechnet nach der Bardeen-Press-Teukolsky-Formel. Bei Erhöhung des Spins auf 0,95 wandert der Innenrand der Scheibe von 3,0 auf 0,95 nach innen, wodurch Gas viel tiefer absinken und enorme Gravitationsenergie freisetzen kann.",
    "lensingTitle": "Gravitationslinse und Photonenring: ",
    "lensingDesc": "jeder Lichtstrahl folgt Null-Geodäten, integriert mit einem symplektischen Verlet-Verfahren 2. Ordnung unter Berücksichtigung gravitomagnetischer Beschleunigung.",
    "dopplerTitle": "Doppler-Effekt und Beaming: ",
    "dopplerDesc": "progrades Gas, das sich auf den Beobachter zubewegt, erfährt eine intensive Blauverschiebung und eine quartische Helligkeitsverstärkung (δ⁴)."
  }
};
