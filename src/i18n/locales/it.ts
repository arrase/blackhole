import type { Translation } from "../types";

export const it: Translation = {
  "title": "Gargantua · Simulazione di Buco Nero",
  "subtitle": "Buco nero supermassiccio · Simulazione relativistica in tempo reale",
  "presets": {
    "cine": "Vista Interstellar",
    "kerr": "Ombra di Kerr",
    "cerca": "Avvicinamento",
    "arriba": "Dall'alto",
    "plano": "Piano del disco"
  },
  "hud": "Trascina per orbitare · Scorri per zoomare",
  "webglUnsupported": "Il tuo browser non supporta WebGL",
  "buttons": {
    "info": "Cosa sto guardando?",
    "hideControls": "Nascondi controlli",
    "showControls": "Controlli",
    "close": "Chiudi"
  },
  "controls": {
    "quality": "Qualità",
    "qualityLevels": [
      "Bassa",
      "Media",
      "Alta"
    ],
    "spin": "Rotazione (Spin di Kerr)",
    "intensity": "Luminosità del disco",
    "diskSpeed": "Velocità del disco",
    "diskTemp": "Temperatura del disco",
    "glow": "Anello di fotoni",
    "stars": "Stelle",
    "fov": "Zoom dell'obiettivo",
    "autoRotate": "Rotazione automatica"
  },
  "info": {
    "title": "LA FISICA DIETRO",
    "metricTitle": "Metrica di Kerr e Spin: ",
    "metricDesc": "simula un buco nero in rotazione relativistica. La rotazione trascina la struttura stessa dello spaziotempo (effetto Lense-Thirring / frame dragging), appiattendo l'ombra sul lato che ruota verso di noi per formare una caratteristica sagoma a forma di \"D\".",
    "horizonTitle": "Orizzonte ed Ergosfera: ",
    "horizonDesc": "l'orizzonte degli eventi si contrae con lo spin secondo r+ = M + √(M²-a²). All'esterno si estende l'ergosfera, dove il trascinamento costringe tutta la materia a orbitare nel senso di rotazione.",
    "iscoTitle": "Orbita circolare stabile più interna (ISCO): ",
    "iscoDesc": "calcolata con la formula di Bardeen-Press-Teukolsky. All'aumentare dello spin a 0.95, il bordo interno del disco passa da 3.0 a 0.95, consentendo al gas di penetrare molto più a fondo e rilasciare un'enorme energia gravitazionale.",
    "lensingTitle": "Lente gravitazionale e Anello di fotoni: ",
    "lensingDesc": "ogni raggio segue geodetiche nulle integrate con Verlet simplettico di 2° ordine considerando l'accelerazione gravitomagnetica.",
    "dopplerTitle": "Effetto Doppler e Beaming: ",
    "dopplerDesc": "il gas progrado che viaggia verso l'osservatore subisce un intenso spostamento verso il blu e un'amplificazione luminosa quartica (δ⁴)."
  }
};
