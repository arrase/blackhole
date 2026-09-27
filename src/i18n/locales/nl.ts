import type { Translation } from "../types";

export const nl: Translation = {
  "title": "Gargantua · Zwart Gat Simulatie",
  "subtitle": "Superzwaar zwart gat · Realtime relativistische simulatie",
  "presets": {
    "cine": "Interstellar-weergave",
    "kerr": "Kerr-schaduw",
    "cerca": "Dichtbij naderen",
    "arriba": "Bovenaanzicht",
    "plano": "Schijfvlak"
  },
  "hud": "Sleep om te draaien · Scroll om te zoomen",
  "webglUnsupported": "Uw browser ondersteunt geen WebGL",
  "buttons": {
    "info": "Wat zie ik?",
    "hideControls": "Bediening verbergen",
    "showControls": "Bediening",
    "close": "Sluiten"
  },
  "controls": {
    "quality": "Kwaliteit",
    "qualityLevels": [
      "Laag",
      "Gemiddeld",
      "Hoog"
    ],
    "spin": "Rotatie (Kerr-spin)",
    "intensity": "Schijfhelderheid",
    "diskSpeed": "Schijfsnelheid",
    "glow": "Fotonenring",
    "stars": "Sterren",
    "fov": "Lenszoom",
    "autoRotate": "Automatisch draaien"
  },
  "info": {
    "title": "DE FYSICA ERACTER",
    "metricTitle": "Kerr-metriek en spin: ",
    "metricDesc": "simuleert een relativistisch roterend zwart gat. De rotatie sleept de ruimtetijd zelf mee (Lense-Thirring-effect / frame dragging), waardoor de schaduw aan de naar ons toe roterende zijde afvlakt tot een karakteristiek D-vormig silhouet.",
    "horizonTitle": "Gebeurtenishorizon en Ergosfeer: ",
    "horizonDesc": "de waarnemingshorizon krimpt met de spin volgens r+ = M + √(M²-a²). Aan de buitenzijde ontstaat de ergosfeer, waar frame dragging alle materie dwingt in de rotatierichting te bewegen.",
    "iscoTitle": "Binnenste stabiele cirkelbaan (ISCO): ",
    "iscoDesc": "berekend met de Bardeen-Press-Teukolsky-formule. Bij een spin van 0,95 schuift de binnenrand van de schijf op van 3,0 naar 0,95, waardoor gas dieper kan vallen en enorme zwaartekrachtenergie vrijmaakt.",
    "lensingTitle": "Zwaartekrachtlens & Fotonenring: ",
    "lensingDesc": "elke lichtstraal volgt nul-geodeten geïntegreerd met 2e-orde symplectische Verlet rekening houdend met gravitomagnetische versnelling.",
    "dopplerTitle": "Doppler-effect en Beaming: ",
    "dopplerDesc": "het prograderende gas dat naar de waarnemer toe beweegt ervaart sterke blauwverschuiving en quartische relativistische stralingsbundeling (δ⁴)."
  }
};
