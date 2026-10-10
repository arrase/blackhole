import type { Translation } from "../types";

export const hu: Translation = {
  "title": "Gargantua · Fekete lyuk szimuláció",
  "subtitle": "Szupermasszív fekete lyuk · Valós idejű relativisztikus szimuláció",
  "presets": {
    "cine": "Csillagok között nézet",
    "kerr": "Kerr-árnyék",
    "cerca": "Közelítés",
    "arriba": "Felülnézet",
    "plano": "Akkréciós korong síkja"
  },
  "hud": "Húzza a forgatáshoz · Görgessen a nagyításhoz",
  "webglUnsupported": "Böngészője nem támogatja a WebGL-t",
  "buttons": {
    "info": "Mit látok?",
    "hideControls": "Vezérlők elrejtése",
    "showControls": "Vezérlők",
    "close": "Bezárás"
  },
  "controls": {
    "spin": "Forgás (Kerr-spin)",
    "intensity": "Korong fényessége",
    "diskSpeed": "Korong sebessége",
    "diskTemp": "Korong hőmérséklete",
    "glow": "Lencseragyogás",
    "stars": "Csillagok",
    "fov": "Lencse zoom",
    "autoRotate": "Automatikus forgás",
    "accretionDisk": "Akkréciós korong"
  },
  "info": {
    "title": "A MÖGÖTTES FIZIKA",
    "metricTitle": "Kerr-metrika és spin: ",
    "metricDesc": "relativisztikusan forgó fekete lyukat szimulál. A forgás magával ragadja a téridő szövetét (Lense-Thirring hatás / vonatkoztatási rendszer elhúzása), lelapítva a felénk forgó oldalon az árnyékot egy jellegzetes D-alakú sziluetté.",
    "horizonTitle": "Eseményhorizont és Ergoszféra: ",
    "horizonDesc": "az eseményhorizont a spin növekedésével összehúzódik az r+ = M + √(M²-a²) képlet szerint. Kívül jön létre az ergoszféra, ahol a téridő húzása minden anyagot a forgás irányába kényszerít.",
    "iscoTitle": "Legbelső stabil körpálya (ISCO): ",
    "iscoDesc": "a Bardeen-Press-Teukolsky képlettel számítva. A spin 0.95-re növelésével a korong belső pereme 3.0-ról 0.97-re csökken, lehetővé téve a gáz mélyebbre zuhanását és óriási gravitációs energia felszabadulását.",
    "lensingTitle": "Gravitációs lencsehatás és Fotongyűrű: ",
    "lensingDesc": "minden sugarat visszafelé követünk a Kerr-metrika egy pontos null-geodetikusa mentén (Kerr–Schild-koordináták): a korong az árnyék fölött és alatt is látszik, magasabb rendű képei pedig a vékony fotongyűrűt alkotják.",
    "dopplerTitle": "Doppler-effektus és Sugárzási nyalábosodás: ",
    "dopplerDesc": "a látott fény egy g·T hőmérsékletű feketetest sugárzása, ahol g a Doppler-eltolódást és a gravitációs vöröseltolódást egyesíti (bolometrikus intenzitás ∝ g⁴): a felénk közeledő oldal fényesebbnek és fehérebbnek, a távolodó halványabbnak és vörösebbnek látszik."
  }
};
