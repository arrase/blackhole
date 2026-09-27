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
    "quality": "Kvaliteta",
    "qualityLevels": [
      "Niska",
      "Srednja",
      "Visoka",
      "Ultra"
    ],
    "spin": "Rotacija (Kerrov spin)",
    "intensity": "Svjetlina diska",
    "diskSpeed": "Brzina diska",
    "glow": "Fotonski prsten",
    "stars": "Zvijezde",
    "fov": "Zum objektiva",
    "autoRotate": "Automatska rotacija"
  },
  "info": {
    "title": "FIZIKA IZA POJAVE",
    "metricTitle": "Kerrova metrika i spin: ",
    "metricDesc": "simulira crnu rupu s relativističkom rotacijom. Vrtnja povlači samo tkivo prostor-vremena (Lense-Thirringov učinak), spljoštavajući sjenu na strani koja rotira prema nama u prepoznatljiv oblik slova „D“.",
    "horizonTitle": "Horizont događaja i Ergosfera: ",
    "horizonDesc": "horizont događaja se skuplja sa spinom prema r+ = M + √(M²-a²). Izvana nastaje ergosfera, gdje povlačenje prisiljava svu materiju da orbitira u smjeru rotacije.",
    "iscoTitle": "Najunutarnija stabilna kružna orbita (ISCO): ",
    "iscoDesc": "izračunata formulom Bardeen-Press-Teukolsky. Povećanjem spina na 0.95 unutarnji rub diska pomiče se s 3.0 na 0.95, omogućujući plinu da prodre dublje i oslobodi golemu energiju.",
    "lensingTitle": "Gravitacijska leća i Fotonski prsten: ",
    "lensingDesc": "svaka zraka prati nulte geodezike integrirane simplektičkom Verletovom metodom 2. reda uzimajući u obzir gravitomagnetsko ubrzanje.",
    "dopplerTitle": "Dopplerov učinak i Relativističko pojačanje: ",
    "dopplerDesc": "plin koji putuje prema promatraču trpi intenzivan plavi pomak i četverostruko pojačanje zračenja (δ⁴)."
  }
};
