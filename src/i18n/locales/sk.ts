import type { Translation } from "../types";

export const sk: Translation = {
  "title": "Gargantua · Simulácia čiernej diery",
  "subtitle": "Supermasívna čierna diera · Relativistická simulácia v reálnom čase",
  "presets": {
    "cine": "Pohľad Interstellar",
    "kerr": "Kerrov tieň",
    "cerca": "Priblíženie",
    "arriba": "Pohľad zhora",
    "plano": "Rovina disku"
  },
  "hud": "Ťahaním otáčajte · Rolovaním približujte",
  "webglUnsupported": "Váš prehliadač nepodporuje WebGL",
  "buttons": {
    "info": "Na čo sa pozerám?",
    "hideControls": "Skryť ovládanie",
    "showControls": "Ovládanie",
    "close": "Zavrieť"
  },
  "controls": {
    "quality": "Kvalita",
    "qualityLevels": [
      "Nízka",
      "Stredná",
      "Vysoká"
    ],
    "spin": "Rotácia (Kerrov spin)",
    "intensity": "Jas disku",
    "diskSpeed": "Rýchlosť disku",
    "glow": "Fotónový prstenec",
    "stars": "Hviezdy",
    "fov": "Zoom objektívu",
    "autoRotate": "Automatická rotácia"
  },
  "info": {
    "title": "FYZIKÁLNE PRINCÍPY",
    "metricTitle": "Kerrova metrika a spin: ",
    "metricDesc": "simuluje relativisticky rotujúcu čiernu dieru. Rotácia so sebou strháva samotný časopriestor (Lense-Thirringov jav), čím splošťuje tieň na strane rotujúcej k nám do tvaru písmena „D“.",
    "horizonTitle": "Horizont udalostí a ergosféra: ",
    "horizonDesc": "horizont udalostí sa zmenšuje so spinom podľa r+ = M + √(M²-a²). Zvonku vzniká ergosféra, kde strhávanie núti všetku hmotu obiehať v smere rotácie.",
    "iscoTitle": "Najvnútornejšia stabilná kruhová dráha (ISCO): ",
    "iscoDesc": "vypočítaná podľa Bardeen-Press-Teukolského vzorca. Pri zvýšení spinu na 0.95 sa vnútorný okraj disku posúva z 3.0 na 0.95, čo umožňuje plynu klesať oveľa hlbšie a uvoľňovať obrovskú gravitačnú energiu.",
    "lensingTitle": "Gravitačná šošovka a fotónový prstenec: ",
    "lensingDesc": "každý svetelný lúč sleduje nulové geodetiky integrované symplektickou Verletovou metódou 2. rádu so započítaním gravitomagnetického zrýchlenia.",
    "dopplerTitle": "Dopplerov jav a relativistický beaming: ",
    "dopplerDesc": "plyn pohybujúci sa smerom k pozorovateľovi vykazuje silný modrý posun a zosilnenie žiarenia štvrtej mocniny (δ⁴)."
  }
};
