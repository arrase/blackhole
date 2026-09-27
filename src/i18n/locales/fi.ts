import type { Translation } from "../types";

export const fi: Translation = {
  "title": "Gargantua · Mustan aukon simulaatio",
  "subtitle": "Supermassiivinen musta aukko · Reaaliaikainen suhteellisuusteoreettinen simulaatio",
  "presets": {
    "cine": "Interstellar-näkymä",
    "kerr": "Kerrin varjo",
    "cerca": "Lähiohitus",
    "arriba": "Ylhäältä päin",
    "plano": "Kiekkotaso"
  },
  "hud": "Kierrä vetämällä · Zoomaa rullaamalla",
  "webglUnsupported": "Selaimesi ei tue WebGL-tekniikkaa",
  "buttons": {
    "info": "Mitä näen?",
    "hideControls": "Piilota säätimet",
    "showControls": "Säätimet",
    "close": "Sulje"
  },
  "controls": {
    "quality": "Laatu",
    "qualityLevels": [
      "Matala",
      "Keskitaso",
      "Korkea"
    ],
    "spin": "Pyöriminen (Kerr-spin)",
    "intensity": "Kiekon kirkkaus",
    "diskSpeed": "Kiekon nopeus",
    "diskTemp": "Kiekon lämpötila",
    "glow": "Fotonirengas",
    "stars": "Tähdet",
    "fov": "Linssin zoom",
    "autoRotate": "Automaattinen pyöritys"
  },
  "info": {
    "title": "TAUSTALLA OLEVA FYSIIKKA",
    "metricTitle": "Kerrin metriikka ja spin: ",
    "metricDesc": "simuloi suhteellisuusteoreettisesti pyörivää mustaa aukkoa. Pyöriminen vetää mukaansa aika-avaruuden kudosta (Lense-Thirring-ilmiö), litistäen meitä kohti pyörivän puolen varjon D-kirjaimen muotoiseksi siluetiksi.",
    "horizonTitle": "Tapahtumahorisontti ja Ergosfääri: ",
    "horizonDesc": "tapahtumahorisontti kutistuu spinin kasvaessa kaavan r+ = M + √(M²-a²) mukaisesti. Ulkopuolelle muodostuu ergosfääri, jossa aika-avaruuden raahaus pakottaa kaiken aineen kiertämään pyörimissuuntaan.",
    "iscoTitle": "Sisin vakaa ympyrärata (ISCO): ",
    "iscoDesc": "laskettu Bardeen-Press-Teukolsky-kaavalla. Spinin noustessa arvoon 0,95 kiekon sisäreuna siirtyy arvosta 3,0 arvoon 0,95, jolloin kaasu pääsee putoamaan syvemmälle ja vapauttamaan valtavasti gravitaatioenergiaa.",
    "lensingTitle": "Gravitaatiolinssi ja Fotonirengas: ",
    "lensingDesc": "jokainen valonsäde kulkee nollageodeetteja pitkin, jotka on integroitu toisen kertaluvun symplektisellä Verlet-menetelmällä huomioiden gravitomagneettinen kiihtyvyys.",
    "dopplerTitle": "Doppler-ilmiö ja Sädehtiminen: ",
    "dopplerDesc": "havaitsijaa kohti kulkeva kaasu kokee voimakkaan sinisiirtymän ja neljänteen potenssiin suhteutetun kirkkauden vahvistumisen (δ⁴)."
  }
};
