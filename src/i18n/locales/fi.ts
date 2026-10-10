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
    "spin": "Pyöriminen (Kerr-spin)",
    "intensity": "Kiekon kirkkaus",
    "diskSpeed": "Kiekon nopeus",
    "diskTemp": "Kiekon lämpötila",
    "glow": "Linssin hehku",
    "stars": "Tähdet",
    "fov": "Linssin zoom",
    "autoRotate": "Automaattinen pyöritys",
    "accretionDisk": "Kertymäkiekko"
  },
  "info": {
    "title": "TAUSTALLA OLEVA FYSIIKKA",
    "metricTitle": "Kerrin metriikka ja spin: ",
    "metricDesc": "simuloi suhteellisuusteoreettisesti pyörivää mustaa aukkoa. Pyöriminen vetää mukaansa aika-avaruuden kudosta (Lense-Thirring-ilmiö), litistäen meitä kohti pyörivän puolen varjon D-kirjaimen muotoiseksi siluetiksi.",
    "horizonTitle": "Tapahtumahorisontti ja Ergosfääri: ",
    "horizonDesc": "tapahtumahorisontti kutistuu spinin kasvaessa kaavan r+ = M + √(M²-a²) mukaisesti. Ulkopuolelle muodostuu ergosfääri, jossa aika-avaruuden raahaus pakottaa kaiken aineen kiertämään pyörimissuuntaan.",
    "iscoTitle": "Sisin vakaa ympyrärata (ISCO): ",
    "iscoDesc": "laskettu Bardeen-Press-Teukolsky-kaavalla. Spinin noustessa arvoon 0,95 kiekon sisäreuna siirtyy arvosta 3,0 arvoon 0,97, jolloin kaasu pääsee putoamaan syvemmälle ja vapauttamaan valtavasti gravitaatioenergiaa.",
    "lensingTitle": "Gravitaatiolinssi ja Fotonirengas: ",
    "lensingDesc": "jokainen säde jäljitetään taaksepäin tarkkaa Kerrin metriikan nollageodeesia pitkin (Kerr–Schild-koordinaatit): kiekko näkyy varjon ylä- ja alapuolella, ja sen korkeamman kertaluvun kuvat muodostavat ohuen fotonirenkaan.",
    "dopplerTitle": "Doppler-ilmiö ja Sädehtiminen: ",
    "dopplerDesc": "näkemämme valo on mustan kappaleen säteilyä lämpötilassa g·T, jossa g yhdistää Doppler-siirtymän ja gravitaatiopunasiirtymän (bolometrinen intensiteetti ∝ g⁴): meitä kohti liikkuva puoli näyttää kirkkaammalta ja valkoisemmalta, loittoneva puoli himmeämmältä ja punaisemmalta."
  }
};
