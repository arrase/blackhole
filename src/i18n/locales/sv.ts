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
    "quality": "Kvalitet",
    "qualityLevels": [
      "Låg",
      "Medel",
      "Hög"
    ],
    "spin": "Rotation (Kerr-spinn)",
    "intensity": "Diskens ljusstyrka",
    "diskSpeed": "Diskhastighet",
    "glow": "Fotonring",
    "stars": "Stjärnor",
    "fov": "Kameralinszoom",
    "autoRotate": "Automatisk rotation"
  },
  "info": {
    "title": "FYSIKEN BAKOM",
    "metricTitle": "Kerr-metrik och spinn: ",
    "metricDesc": "simulerar ett svart hål med relativistisk rotation. Rotationen drar med sig rumtidens väv (Lense-Thirring-effekten / frame dragging), vilket plattar till skuggan på den sida som roterar mot oss till en karakteristisk D-formad silhuett.",
    "horizonTitle": "Händelsehorisont och Ergosfär: ",
    "horizonDesc": "händelsehorisonten drar ihop sig med spinnet enligt r+ = M + √(M²-a²). Utanför bildas ergosfären, där rumsdragningen tvingar all materia att kretsa i rotationsriktningen.",
    "iscoTitle": "Innersta stabila cirkulära banan (ISCO): ",
    "iscoDesc": "beräknad med Bardeen-Press-Teukolsky-formeln. När spinnet ökar till 0,95 förskjuts diskens innerkant från 3,0 ner till 0,95, vilket gör att gasen störtar djupare och frigör enorm gravitationell energi.",
    "lensingTitle": "Gravitationslins och Fotonring: ",
    "lensingDesc": "varje ljusstråle följer noll-geodeter integrerade med 2:a ordningens symplektisk Verlet som beaktar gravitomagnetisk acceleration.",
    "dopplerTitle": "Dopplereffekt och Relativistisk beaming: ",
    "dopplerDesc": "prograd gas som rör sig mot observatören genomgår en kraftig blåförskjutning och en kvartisk ljusförstärkning (δ⁴)."
  }
};
