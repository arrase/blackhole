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
    "spin": "Rotation (Kerr-Spin)",
    "intensity": "Scheibenhelligkeit",
    "diskSpeed": "Scheibengeschwindigkeit",
    "diskTemp": "Scheibentemperatur",
    "glow": "Linsenschein",
    "stars": "Sterne",
    "fov": "Kamerazoom",
    "autoRotate": "Automatische Rotation",
    "accretionDisk": "Akkretionsscheibe"
  },
  "info": {
    "title": "DIE PHYSIK DAHINTER",
    "metricTitle": "Kerr-Metrik und Spin: ",
    "metricDesc": "simuliert ein relativistisch rotierendes Schwarzes Loch. Die Drehung zieht die Raumzeit selbst mit (Lense-Thirring-Effekt / Frame-Dragging), wodurch der Schatten auf der auf uns zu rotierenden Seite abgeflacht wird und eine charakteristische D-förmige Silhouette entsteht.",
    "horizonTitle": "Ereignishorizont und Ergosphäre: ",
    "horizonDesc": "der Ereignishorizont schrumpft mit dem Spin gemäß r+ = M + √(M²-a²). Davor entsteht die Ergosphäre, in der das Frame-Dragging jegliche Materie zwingt, in Rotationsrichtung zu kreisen.",
    "iscoTitle": "Innerste stabile Kreisbahn (ISCO): ",
    "iscoDesc": "berechnet nach der Bardeen-Press-Teukolsky-Formel. Bei Erhöhung des Spins auf 0,95 wandert der Innenrand der Scheibe von 3,0 auf 0,97 nach innen, wodurch Gas viel tiefer absinken und enorme Gravitationsenergie freisetzen kann.",
    "lensingTitle": "Gravitationslinse und Photonenring: ",
    "lensingDesc": "jeder Strahl wird entlang einer exakten Null-Geodäte der Kerr-Metrik rückwärts verfolgt (Kerr-Schild-Koordinaten): Die Scheibe erscheint über und unter dem Schatten, und ihre Bilder höherer Ordnung bilden den dünnen Photonenring.",
    "dopplerTitle": "Doppler-Effekt und Beaming: ",
    "dopplerDesc": "das sichtbare Licht ist das eines Schwarzkörpers bei g·T, wobei g Dopplerverschiebung und gravitative Rotverschiebung vereint (bolometrische Intensität ∝ g⁴): Die auf uns zukommende Seite wirkt heller und weißer, die sich entfernende schwächer und röter."
  }
};
