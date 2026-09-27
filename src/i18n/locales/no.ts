import type { Translation } from "../types";

export const no: Translation = {
  "title": "Gargantua · Simulering av sort hull",
  "subtitle": "Supermassivt sort hull · Relativistisk sanntidssimulering",
  "presets": {
    "cine": "Interstellar-visning",
    "kerr": "Kerr-skygge",
    "cerca": "Nærming",
    "arriba": "Sett ovenfra",
    "plano": "Akkresjonsskiveplan"
  },
  "hud": "Dra for å rotere · Rull for å zoome",
  "webglUnsupported": "Nettleseren din støtter ikke WebGL",
  "buttons": {
    "info": "Hva ser jeg?",
    "hideControls": "Skjul kontroller",
    "showControls": "Kontroller",
    "close": "Lukk"
  },
  "controls": {
    "quality": "Kvalitet",
    "qualityLevels": [
      "Lav",
      "Middels",
      "Høy",
      "Ultra"
    ],
    "spin": "Rotasjon (Kerr-spinn)",
    "intensity": "Skivens lysstyrke",
    "diskSpeed": "Skivehastighet",
    "glow": "Fotonring",
    "stars": "Stjerner",
    "fov": "Kamerazoom",
    "autoRotate": "Automatisk rotasjon"
  },
  "info": {
    "title": "FYSIKKEN BAK",
    "metricTitle": "Kerr-metrikk og spinn: ",
    "metricDesc": "simulerer et relativistisk roterende sort hull. Rotasjonen drar med seg selve romtiden (Lense-Thirring-effekt / rammedragning), slik at skyggen flates ut på siden som roterer mot oss i en karakteristisk D-form.",
    "horizonTitle": "Hendelseshorisont og Ergosfære: ",
    "horizonDesc": "hendelseshorisonten krymper med spinn ifølge r+ = M + √(M²-a²). Utenfor oppstår ergosfæren, hvor romdragningen tvinger alt stoff til å rotere i spinnretningen.",
    "iscoTitle": "Innerste stabile sirkulære bane (ISCO): ",
    "iscoDesc": "beregnet med Bardeen-Press-Teukolsky-formelen. Når spinnet økes til 0,95, krymper skivens indre kant fra 3,0 til 0,95, slik at gassen faller dypere og frigjør enorm gravitasjonsenergi.",
    "lensingTitle": "Gravitasjonslinse og Fotonring: ",
    "lensingDesc": "hver lysstråle følger null-geodeter integrert med 2. ordens symplektisk Verlet under hensyn til gravitomagnetisk akselerasjon.",
    "dopplerTitle": "Dopplereffekt og Relativistisk beaming: ",
    "dopplerDesc": "gass som beveger seg mot observatøren gjennomgår kraftig blåforskyvning og en fjerdepotens lysforsterkning (δ⁴)."
  }
};
