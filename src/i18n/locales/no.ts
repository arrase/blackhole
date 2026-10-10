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
    "spin": "Rotasjon (Kerr-spinn)",
    "intensity": "Skivens lysstyrke",
    "diskSpeed": "Skivehastighet",
    "diskTemp": "Skivetemperatur",
    "glow": "Linseglød",
    "stars": "Stjerner",
    "fov": "Kamerazoom",
    "autoRotate": "Automatisk rotasjon",
    "accretionDisk": "Akkresjonsskive"
  },
  "info": {
    "title": "FYSIKKEN BAK",
    "metricTitle": "Kerr-metrikk og spinn: ",
    "metricDesc": "simulerer et relativistisk roterende sort hull. Rotasjonen drar med seg selve romtiden (Lense-Thirring-effekt / rammedragning), slik at skyggen flates ut på siden som roterer mot oss i en karakteristisk D-form.",
    "horizonTitle": "Hendelseshorisont og Ergosfære: ",
    "horizonDesc": "hendelseshorisonten krymper med spinn ifølge r+ = M + √(M²-a²). Utenfor oppstår ergosfæren, hvor romdragningen tvinger alt stoff til å rotere i spinnretningen.",
    "iscoTitle": "Innerste stabile sirkulære bane (ISCO): ",
    "iscoDesc": "beregnet med Bardeen-Press-Teukolsky-formelen. Når spinnet økes til 0,95, krymper skivens indre kant fra 3,0 til 0,97, slik at gassen faller dypere og frigjør enorm gravitasjonsenergi.",
    "lensingTitle": "Gravitasjonslinse og Fotonring: ",
    "lensingDesc": "hver stråle spores bakover langs en eksakt nullgeodet i Kerr-metrikken (Kerr-Schild-koordinater): skiven sees over og under skyggen, og bildene av høyere orden danner den tynne fotonringen.",
    "dopplerTitle": "Dopplereffekt og Relativistisk beaming: ",
    "dopplerDesc": "lyset vi ser er fra et svart legeme ved g·T, der g kombinerer dopplerforskyvning og gravitasjonell rødforskyvning (bolometrisk intensitet ∝ g⁴): siden som beveger seg mot oss ser lysere og hvitere ut, siden som fjerner seg svakere og rødere."
  }
};
