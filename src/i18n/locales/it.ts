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
    "spin": "Rotazione (Spin di Kerr)",
    "intensity": "Luminosità del disco",
    "diskSpeed": "Velocità del disco",
    "diskTemp": "Temperatura del disco",
    "glow": "Bagliore ottico",
    "stars": "Stelle",
    "fov": "Zoom dell'obiettivo",
    "autoRotate": "Rotazione automatica",
    "accretionDisk": "Disco di accrescimento"
  },
  "info": {
    "title": "LA FISICA DIETRO",
    "metricTitle": "Metrica di Kerr e Spin: ",
    "metricDesc": "simula un buco nero in rotazione relativistica. La rotazione trascina la struttura stessa dello spaziotempo (effetto Lense-Thirring / frame dragging), appiattendo l'ombra sul lato che ruota verso di noi per formare una caratteristica sagoma a forma di \"D\".",
    "horizonTitle": "Orizzonte ed Ergosfera: ",
    "horizonDesc": "l'orizzonte degli eventi si contrae con lo spin secondo r+ = M + √(M²-a²). All'esterno si estende l'ergosfera, dove il trascinamento costringe tutta la materia a orbitare nel senso di rotazione.",
    "iscoTitle": "Orbita circolare stabile più interna (ISCO): ",
    "iscoDesc": "calcolata con la formula di Bardeen-Press-Teukolsky. All'aumentare dello spin a 0.95, il bordo interno del disco passa da 3.0 a 0.97, consentendo al gas di penetrare molto più a fondo e rilasciare un'enorme energia gravitazionale.",
    "lensingTitle": "Lente gravitazionale e Anello di fotoni: ",
    "lensingDesc": "ogni raggio viene tracciato a ritroso lungo una geodetica nulla esatta di Kerr (coordinate di Kerr-Schild): il disco appare sopra e sotto l'ombra, e le sue immagini di ordine superiore formano il sottile anello di fotoni.",
    "dopplerTitle": "Effetto Doppler e Beaming: ",
    "dopplerDesc": "la luce che vediamo è quella di un corpo nero a g·T, dove g combina l'effetto Doppler e il redshift gravitazionale (intensità bolometrica ∝ g⁴): il lato che si avvicina appare più luminoso e bianco, quello che si allontana più tenue e rossastro."
  }
};
