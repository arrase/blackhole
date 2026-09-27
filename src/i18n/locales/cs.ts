import type { Translation } from "../types";

export const cs: Translation = {
  "title": "Gargantua · Simulace černé díry",
  "subtitle": "Supermasivní černá díra · Relativistická simulace v reálném čase",
  "presets": {
    "cine": "Pohled Interstellar",
    "kerr": "Kerrovi stín",
    "cerca": "Přiblížení",
    "arriba": "Pohled shora",
    "plano": "Rovina disku"
  },
  "hud": "Tažením otáčejte · Rolováním přibližujte",
  "webglUnsupported": "Váš prohlížeč nepodporuje WebGL",
  "buttons": {
    "info": "Na co se dívám?",
    "hideControls": "Skrýt ovládání",
    "showControls": "Ovládání",
    "close": "Zavřít"
  },
  "controls": {
    "quality": "Kvalita",
    "qualityLevels": [
      "Nízká",
      "Střední",
      "Vysoká"
    ],
    "spin": "Rotace (Kerrův spin)",
    "intensity": "Jas disku",
    "diskSpeed": "Rychlost disku",
    "glow": "Fotonový prstenec",
    "stars": "Hvězdy",
    "fov": "Zoom objektivu",
    "autoRotate": "Automatická rotace"
  },
  "info": {
    "title": "FYZIKÁLNÍ PRINCIPY",
    "metricTitle": "Kerrova metrika a spin: ",
    "metricDesc": "simuluje relativisticky rotující černou díru. Rotace s sebou strhává samotný časoprostor (Lense-Thirringův jev / strhávání časoprostoru), což zplošťuje stín na straně rotující k nám do tvaru písmene „D“.",
    "horizonTitle": "Horizont událostí a ergosféra: ",
    "horizonDesc": "horizont událostí se zmenšuje se spinem podle r+ = M + √(M²-a²). Vně vzniká ergosféra, kde strhávání nutí veškerou hmotu obíhat ve směru rotace.",
    "iscoTitle": "Nejzazší stabilní kruhová dráha (ISCO): ",
    "iscoDesc": "vypočtená podle Bardeen-Press-Teukolského vzorce. Při zvýšení spinu na 0.95 se vnitřní okraj disku posouvá z 3.0 na 0.95, což umožňuje plynu klesat mnohem hlouběji a uvolňovat obrovskou gravitační energii.",
    "lensingTitle": "Gravitační čočka a fotonový prstenec: ",
    "lensingDesc": "každý světelný paprsek sleduje nulové geodetiky integrované symplektickou Verletovou metodou 2. řádu se započtením gravitomagnetického zrychlení.",
    "dopplerTitle": "Dopplerův jev a relativistický beaming: ",
    "dopplerDesc": "plyn pohybující se směrem k pozorovateli vykazuje silný modrý posuv a čtvrtou mocninou škálované zesílení záření (δ⁴)."
  }
};
