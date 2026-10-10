import type { Translation } from "../types";

export const lv: Translation = {
  "title": "Gargantua · Melnā cauruma simulācija",
  "subtitle": "Supermasīvs melnais caurums · Relatīvistiska reāllaika simulācija",
  "presets": {
    "cine": "Interstellar skats",
    "kerr": "Kerra ēna",
    "cerca": "Tuvināšanās",
    "arriba": "Skats no augšas",
    "plano": "Diska plakne"
  },
  "hud": "Velciet, lai rotētu · Ritiniet, lai pietuvinātu",
  "webglUnsupported": "Jūsu pārlūkprogramma neatbalsta WebGL",
  "buttons": {
    "info": "Ko es redzu?",
    "hideControls": "Paslēpt vadīklas",
    "showControls": "Vadīklas",
    "close": "Aizvērt"
  },
  "controls": {
    "spin": "Rotācija (Kerra spins)",
    "intensity": "Diska spilgtums",
    "diskSpeed": "Diska ātrums",
    "diskTemp": "Diska temperatūra",
    "glow": "Objektīva mirdzums",
    "stars": "Zvaigznes",
    "fov": "Kameras tālummaiņa",
    "autoRotate": "Automātiska rotācija",
    "accretionDisk": "Akrēcijas disks"
  },
  "info": {
    "title": "FIZIKĀLIE PAMATI",
    "metricTitle": "Kerra metrika un spins: ",
    "metricDesc": "simulē rotējošu melno caurumu. Rotācija velk līdzi pašu telplaika audumu (Lense-Thirring efekts), saplacinot ēnu pusē, kas rotē pret mums, raksturīgā «D» burta formā.",
    "horizonTitle": "Notikumu horizonts un Ergosfēra: ",
    "horizonDesc": "notikumu horizonts saraujas līdz ar spinu saskaņā ar r+ = M + √(M²-a²). Ārpusē veidojas ergosfēra, kurā telpas vilkšana liek visai matērijai orbitēt rotācijas virzienā.",
    "iscoTitle": "Iekšējā stabilā riņķveida orbīta (ISCO): ",
    "iscoDesc": "aprēķināta pēc Bardeen-Press-Teukolsky formulas. Palielinot spinu līdz 0.95, diska iekšējā mala samazinās no 3.0 līdz 0.97, ļaujot gāzei iekļūt daudz dziļāk un atbrīvot milzīgu enerģiju.",
    "lensingTitle": "Gravitācijas lēca un Fotonu gredzens: ",
    "lensingDesc": "katrs stars tiek izsekots atpakaļ pa precīzu Kera metrikas nulles ģeodēzisko līniju (Kera-Šilda koordinātas): disks redzams virs un zem ēnas, un tā augstākas kārtas attēli veido plāno fotonu gredzenu.",
    "dopplerTitle": "Doplera efekts un Relatīvistiskā starojuma fokusēšana: ",
    "dopplerDesc": "redzamā gaisma ir absolūti melna ķermeņa starojums temperatūrā g·T, kur g apvieno Doplera nobīdi un gravitācijas sarkano nobīdi (bolometriskā intensitāte ∝ g⁴): mums tuvojošā puse šķiet spožāka un baltāka, attālinošā – blāvāka un sarkanāka."
  }
};
