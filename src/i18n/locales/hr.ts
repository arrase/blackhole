import type { Translation } from "../types";

export const hr: Translation = {
  "title": "Gargantua · Simulacija crne rupe",
  "subtitle": "Supermasivna crna rupa · Relativistička simulacija u stvarnom vremenu",
  "presets": {
    "cine": "Interstellar pogled",
    "kerr": "Kerrova sjena",
    "cerca": "Približavanje",
    "arriba": "Pogled odozgo",
    "plano": "Ravnina diska"
  },
  "hud": "Povucite za orbitiranje · Kotačić za zumiranje",
  "webglUnsupported": "Vaš preglednik ne podržava WebGL",
  "buttons": {
    "info": "Što gledam?",
    "hideControls": "Sakrij kontrole",
    "showControls": "Kontrole",
    "close": "Zatvori"
  },
  "controls": {
    "spin": "Rotacija (Kerrov spin)",
    "intensity": "Svjetlina diska",
    "diskSpeed": "Brzina diska",
    "diskTemp": "Temperatura diska",
    "glow": "Sjaj objektiva",
    "stars": "Zvijezde",
    "fov": "Zum objektiva",
    "autoRotate": "Automatska rotacija",
    "accretionDisk": "Akrecijski disk"
  },
  "info": {
    "title": "FIZIKA IZA POJAVE",
    "metricTitle": "Kerrova metrika i spin: ",
    "metricDesc": "simulira crnu rupu s relativističkom rotacijom. Vrtnja povlači samo tkivo prostor-vremena (Lense-Thirringov učinak), spljoštavajući sjenu na strani koja rotira prema nama u prepoznatljiv oblik slova „D“.",
    "horizonTitle": "Horizont događaja i Ergosfera: ",
    "horizonDesc": "horizont događaja se skuplja sa spinom prema r+ = M + √(M²-a²). Izvana nastaje ergosfera, gdje povlačenje prisiljava svu materiju da orbitira u smjeru rotacije.",
    "iscoTitle": "Najunutarnija stabilna kružna orbita (ISCO): ",
    "iscoDesc": "izračunata formulom Bardeen-Press-Teukolsky. Povećanjem spina na 0.95 unutarnji rub diska pomiče se s 3.0 na 0.97, omogućujući plinu da prodre dublje i oslobodi golemu energiju.",
    "lensingTitle": "Gravitacijska leća i Fotonski prsten: ",
    "lensingDesc": "svaka se zraka prati unatrag duž točne nul-geodezije Kerrove metrike (Kerr-Schildove koordinate): disk se vidi iznad i ispod sjene, a njegove slike višeg reda tvore tanki fotonski prsten.",
    "dopplerTitle": "Dopplerov učinak i Relativističko pojačanje: ",
    "dopplerDesc": "svjetlost koju vidimo zračenje je crnog tijela na g·T, gdje g objedinjuje Dopplerov pomak i gravitacijski crveni pomak (bolometrijski intenzitet ∝ g⁴): strana koja nam se približava izgleda svjetlije i bjelje, a ona koja se udaljava tamnije i crvenije."
  }
};
