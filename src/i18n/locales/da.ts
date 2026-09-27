import type { Translation } from "../types";

export const da: Translation = {
  "title": "Gargantua · Simulering af sort hul",
  "subtitle": "Supermassivt sort hul · Relativistisk realtidssimulering",
  "presets": {
    "cine": "Interstellar-visning",
    "kerr": "Kerr-skygge",
    "cerca": "Nær passage",
    "arriba": "Set oppefra",
    "plano": "Diskplan"
  },
  "hud": "Træk for at rotere · Rul for at zoome",
  "webglUnsupported": "Din browser understøtter ikke WebGL",
  "buttons": {
    "info": "Hvad ser jeg?",
    "hideControls": "Skjul knapper",
    "showControls": "Kontroller",
    "close": "Luk"
  },
  "controls": {
    "quality": "Kvalitet",
    "qualityLevels": [
      "Lav",
      "Mellem",
      "Høj"
    ],
    "spin": "Rotation (Kerr-spin)",
    "intensity": "Diskens lysstyrke",
    "diskSpeed": "Diskhastighed",
    "diskTemp": "Disktemperatur",
    "glow": "Fotonring",
    "stars": "Stjerner",
    "fov": "Kamerazoom",
    "autoRotate": "Automatisk rotation"
  },
  "info": {
    "title": "FYSIKKEN BAGVED",
    "metricTitle": "Kerr-metrik og spin: ",
    "metricDesc": "simulerer et relativistisk roterende sort hul. Rotationen trækker selve rumtiden med sig (Lense-Thirring-effekt / frame dragging), så skyggen flades ud på den side, der roterer mod os, i en D-formet silhuet.",
    "horizonTitle": "Begivenhedshorisont og Ergosfære: ",
    "horizonDesc": "begivenhedshorisonten trækker sig sammen med spin ifølge r+ = M + √(M²-a²). Udenfor opstår ergosfæren, hvor rumtrækket tvinger alt stof til at kredse i rotationsretningen.",
    "iscoTitle": "Inderste stabile cirkulære bane (ISCO): ",
    "iscoDesc": "beregnet med Bardeen-Press-Teukolsky-formlen. Når spin øges til 0,95, flytter diskens indre kant fra 3,0 ned til 0,95, så gas kan trænge langt dybere ind og frigøre enorm tyngdeenergi.",
    "lensingTitle": "Gravitationslinse og Fotonring: ",
    "lensingDesc": "hver lysstråle følger nul-geodæter integreret med 2. ordens symplektisk Verlet under hensyntagen til gravitomagnetisk acceleration.",
    "dopplerTitle": "Doppler-effekt og Relativistisk beaming: ",
    "dopplerDesc": "gas, der bevæger sig mod observatøren, udsættes for et kraftigt blåskift og en fjerdepotens relativistisk strålingsforstærkning (δ⁴)."
  }
};
