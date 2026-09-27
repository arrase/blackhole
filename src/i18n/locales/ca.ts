import type { Translation } from "../types";

export const ca: Translation = {
  "title": "Gargantua · Simulació de Forat Negre",
  "subtitle": "Forat negre supermassiu · Simulació relativista en temps real",
  "presets": {
    "cine": "Vista Interstellar",
    "kerr": "Ombra de Kerr",
    "cerca": "Aproximació",
    "arriba": "Des de dalt",
    "plano": "Pla del disc"
  },
  "hud": "Arrossega per orbitar · Roda per apropar",
  "webglUnsupported": "El teu navegador no admet WebGL",
  "buttons": {
    "info": "Què estic veient?",
    "hideControls": "Amagar controls",
    "showControls": "Controls",
    "close": "Tancar"
  },
  "controls": {
    "quality": "Qualitat",
    "qualityLevels": [
      "Baixa",
      "Mitjana",
      "Alta"
    ],
    "spin": "Rotació (Spin Kerr)",
    "intensity": "Brillantor del disc",
    "diskSpeed": "Velocitat del disc",
    "diskTemp": "Temperatura del disc",
    "glow": "Anell de fotons",
    "stars": "Estrelles",
    "fov": "Zoom de lent",
    "autoRotate": "Rotació automàtica"
  },
  "info": {
    "title": "LA FÍSICA AL DARRERE",
    "metricTitle": "Mètrica de Kerr i Espín: ",
    "metricDesc": "simula un forat negre en rotació relativista. El gir arrossega el teixit mateix de l'espai-temps (efecte Lense-Thirring / frame dragging), aplanant l'ombra al costat que gira cap a nosaltres per formar una silueta en forma de \"D\".",
    "horizonTitle": "Horitzó i Ergosfera: ",
    "horizonDesc": "l'horitzó d'esdeveniments es contrau amb l'espín segons r+ = M + √(M²-a²). A l'exterior sorgeix l'ergosfera, on l'arrossegament obliga tota la matèria a orbitar a favor del gir.",
    "iscoTitle": "Òrbita circular estable (ISCO): ",
    "iscoDesc": "calculada amb la fórmula de Bardeen-Press-Teukolsky. En augmentar l'espín a 0.95, la vora interior del disc passa de 3.0 a 0.95, permetent al gas penetrar molt més a fons i alliberar una enorme energia gravitatòria.",
    "lensingTitle": "Lent gravitatòria i Anell de fotons: ",
    "lensingDesc": "cada raig segueix geodèsiques nul·les integrades amb Verlet simplèctic de 2n ordre considerant l'acceleració gravitomagnètica.",
    "dopplerTitle": "Efecte Doppler i Beaming: ",
    "dopplerDesc": "el gas prògrad que viatja cap a l'observador pateix un intens desplaçament cap al blau i una amplificació lluminosa quàrtica (δ⁴)."
  }
};
