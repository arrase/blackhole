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
    "spin": "Rotation (Kerr-spin)",
    "intensity": "Diskens lysstyrke",
    "diskSpeed": "Diskhastighed",
    "diskTemp": "Disktemperatur",
    "glow": "Linseglød",
    "stars": "Stjerner",
    "fov": "Kamerazoom",
    "autoRotate": "Automatisk rotation",
    "accretionDisk": "Akkretionsskive"
  },
  "info": {
    "title": "FYSIKKEN BAGVED",
    "metricTitle": "Kerr-metrik og spin: ",
    "metricDesc": "simulerer et relativistisk roterende sort hul. Rotationen trækker selve rumtiden med sig (Lense-Thirring-effekt / frame dragging), så skyggen flades ud på den side, der roterer mod os, i en D-formet silhuet.",
    "horizonTitle": "Begivenhedshorisont og Ergosfære: ",
    "horizonDesc": "begivenhedshorisonten trækker sig sammen med spin ifølge r+ = M + √(M²-a²). Udenfor opstår ergosfæren, hvor rumtrækket tvinger alt stof til at kredse i rotationsretningen.",
    "iscoTitle": "Inderste stabile cirkulære bane (ISCO): ",
    "iscoDesc": "beregnet med Bardeen-Press-Teukolsky-formlen. Når spin øges til 0,95, flytter diskens indre kant fra 3,0 ned til 0,97, så gas kan trænge langt dybere ind og frigøre enorm tyngdeenergi.",
    "lensingTitle": "Gravitationslinse og Fotonring: ",
    "lensingDesc": "hver lysstråle spores baglæns langs en eksakt nul-geodæt i Kerr-metrikken (Kerr-Schild-koordinater): skiven ses over og under skyggen, og dens billeder af højere orden danner den tynde fotonring.",
    "dopplerTitle": "Doppler-effekt og Relativistisk beaming: ",
    "dopplerDesc": "lyset, vi ser, er et sort legeme ved g·T, hvor g samler dopplerforskydning og gravitationel rødforskydning (bolometrisk intensitet ∝ g⁴): siden, der bevæger sig mod os, ser lysere og hvidere ud, den bortgående side svagere og rødere."
  }
};
