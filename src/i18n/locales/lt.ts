import type { Translation } from "../types";

export const lt: Translation = {
  "title": "Gargantiua · Juodosios skylės simuliacija",
  "subtitle": "Supermasyvi juodoji skylė · Reliatyvistinė simuliacija realiuoju laiku",
  "presets": {
    "cine": "Interstellar vaizdas",
    "kerr": "Kero šešėlis",
    "cerca": "Artėjimas",
    "arriba": "Vaizdas iš viršaus",
    "plano": "Disko plokštuma"
  },
  "hud": "Vilkite, kad suktumėte · Slinkite, kad priartintumėte",
  "webglUnsupported": "Jūsų naršyklė nepalaiko WebGL",
  "buttons": {
    "info": "Ką aš matau?",
    "hideControls": "Slėpti valdiklius",
    "showControls": "Valdikliai",
    "close": "Uždaryti"
  },
  "controls": {
    "quality": "Kokybė",
    "qualityLevels": [
      "Žema",
      "Vidutinė",
      "Aukšta"
    ],
    "spin": "Sukimasis (Kero spinas)",
    "intensity": "Disko ryškumas",
    "diskSpeed": "Disko greitis",
    "diskTemp": "Disko temperatūra",
    "glow": "Fotonų žiedas",
    "stars": "Žvaigždės",
    "fov": "Objektyvo artinimas",
    "autoRotate": "Automatinis sukimasis"
  },
  "info": {
    "title": "FIZIKINIAI PAGRINDAI",
    "metricTitle": "Kero metrika ir spinas: ",
    "metricDesc": "simuliuoja reliatyvistiškai besisukančią juodąją skylę. Sukimasis tempia patį erdvėlaikio audinį (Lense-Thirring efektas), suplokštindamas šešėlį į mus besisukančioje pusėje į „D“ formos siluetą.",
    "horizonTitle": "Įvykių horizontas ir Ergosfera: ",
    "horizonDesc": "įvykių horizontas traukiasi didėjant spinui pagal r+ = M + √(M²-a²). Išorėje susidaro ergosfera, kurioje erdvės vilkimas priverčia visą materiją skrieti sukimosi kryptimi.",
    "iscoTitle": "Giliausia stabili apskritiminė orbita (ISCO): ",
    "iscoDesc": "apskaičiuota pagal Bardeen-Press-Teukolsky formulę. Spinui padidėjus iki 0.95, vidinis disko kraštas sumažėja nuo 3.0 iki 0.95, todėl dujos prasiskverbia kur kas giliau ir atpalaiduoja milžinišką energiją.",
    "lensingTitle": "Gravitacinis lęšis ir Fotonų žiedas: ",
    "lensingDesc": "kiekvienas šviesos spindulys seka nulines geodezines linijas, integruotas 2-os eilės simplektiniu Verlet metodu, atsižvelgiant į gravitomagnetinį pagreitį.",
    "dopplerTitle": "Doplerio efektas ir Reliatyvistinis spinduliavimas: ",
    "dopplerDesc": "į stebėtoją judančios dujos patiria stiprų mėlynąjį poslinkį ir ketvirtojo laipsnio šviesio sustiprinimą (δ⁴)."
  }
};
