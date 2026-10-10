import type { Translation } from "../types";

export const sv: Translation = {
  "title": "Gargantua · Simulering av Svart Hål",
  "subtitle": "Supermassivt svart hål · Relativistisk simulering i realtid",
  "presets": {
    "cine": "Interstellar-vy",
    "kerr": "Kerr-skugga",
    "cerca": "Närmande",
    "arriba": "Ovanifrån",
    "plano": "Diskplan"
  },
  "hud": "Dra för att rotera · Skrolla för att zooma",
  "webglUnsupported": "Din webbläsare stöder inte WebGL",
  "buttons": {
    "info": "Vad tittar jag på?",
    "hideControls": "Dölj reglage",
    "showControls": "Reglage",
    "close": "Stäng"
  },
  "controls": {
    "spin": "Rotation (Kerr-spinn)",
    "intensity": "Diskens ljusstyrka",
    "diskSpeed": "Diskhastighet",
    "diskTemp": "Disktemperatur",
    "glow": "Linsglöd",
    "stars": "Stjärnor",
    "fov": "Kameralinszoom",
    "autoRotate": "Automatisk rotation",
    "accretionDisk": "Ackretionsskiva"
  },
  "info": {
    "title": "FYSIKEN BAKOM",
    "metricTitle": "Kerr-metrik och spinn: ",
    "metricDesc": "simulerar ett svart hål med relativistisk rotation. Rotationen drar med sig rumtidens väv (Lense-Thirring-effekten / frame dragging), vilket plattar till skuggan på den sida som roterar mot oss till en karakteristisk D-formad silhuett.",
    "horizonTitle": "Händelsehorisont och Ergosfär: ",
    "horizonDesc": "händelsehorisonten drar ihop sig med spinnet enligt r+ = M + √(M²-a²). Utanför bildas ergosfären, där rumsdragningen tvingar all materia att kretsa i rotationsriktningen.",
    "iscoTitle": "Innersta stabila cirkulära banan (ISCO): ",
    "iscoDesc": "beräknad med Bardeen-Press-Teukolsky-formeln. När spinnet ökar till 0,95 förskjuts diskens innerkant från 3,0 ner till 0,97, vilket gör att gasen störtar djupare och frigör enorm gravitationell energi.",
    "lensingTitle": "Gravitationslins och Fotonring: ",
    "lensingDesc": "varje stråle spåras bakåt längs en exakt nollgeodet i Kerr-metriken (Kerr–Schild-koordinater): skivan syns ovanför och under skuggan, och dess bilder av högre ordning bildar den tunna fotonringen.",
    "dopplerTitle": "Dopplereffekt och Relativistisk beaming: ",
    "dopplerDesc": "ljuset vi ser är en svartkropp vid g·T, där g förenar dopplerförskjutning och gravitationell rödförskjutning (bolometrisk intensitet ∝ g⁴): sidan som rör sig mot oss ser ljusare och vitare ut, den som avlägsnar sig svagare och rödare."
  }
};
