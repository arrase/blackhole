import type { Translation } from "../types";

export const ro: Translation = {
  "title": "Gargantua · Simulare de Gaură Neagră",
  "subtitle": "Gaură neagră supermasivă · Simulare relativistă în timp real",
  "presets": {
    "cine": "Vedere Interstellar",
    "kerr": "Umbra Kerr",
    "cerca": "Apropiere",
    "arriba": "Vedere de sus",
    "plano": "Planul discului"
  },
  "hud": "Trage pentru a orbita · Derulează pentru zoom",
  "webglUnsupported": "Browserul dumneavoastră nu acceptă WebGL",
  "buttons": {
    "info": "Ce privesc?",
    "hideControls": "Ascunde comenzile",
    "showControls": "Comenzi",
    "close": "Închide"
  },
  "controls": {
    "quality": "Calitate",
    "qualityLevels": [
      "Scăzută",
      "Medie",
      "Ridicată"
    ],
    "spin": "Rotație (Spin Kerr)",
    "intensity": "Luminozitate disc",
    "diskSpeed": "Viteză disc",
    "diskTemp": "Temperatură disc",
    "glow": "Inel de fotoni",
    "stars": "Stele",
    "fov": "Zoom lentilă",
    "autoRotate": "Rotație automată"
  },
  "info": {
    "title": "FIZICA DIN SPATE",
    "metricTitle": "Metrica Kerr și Spinul: ",
    "metricDesc": "simulează o gaură neagră în rotație relativistă. Rotația antrenează însăși țesătura spațiu-timpului (efectul Lense-Thirring / frame dragging), aplatizând umbra de pe partea care se rotește spre noi într-o siluetă caracteristică în formă de „D”.",
    "horizonTitle": "Orizontul evenimentelor și Ergosfera: ",
    "horizonDesc": "orizontul se contractă odată cu spinul conform r+ = M + √(M²-a²). În exterior se formează ergosfera, unde antrenarea spațiului obligă toată materia să orbiteze în direcția rotației.",
    "iscoTitle": "Cea mai interioară orbită circulară stabilă (ISCO): ",
    "iscoDesc": "calculată cu formula Bardeen-Press-Teukolsky. La creșterea spinului la 0.95, marginea interioară a discului coboară de la 3.0 la 0.95, permițând gazului să pătrundă mult mai adânc și să elibereze o uriașă energie gravitațională.",
    "lensingTitle": "Lentilă gravitațională și Inel de fotoni: ",
    "lensingDesc": "fiecare rază luminoasă urmează geodezice nule integrate cu Verlet simplectic de ordinul 2 luând în considerare accelerația gravitomagnetică.",
    "dopplerTitle": "Efect Doppler și Beaming relativist: ",
    "dopplerDesc": "gazul prograd care călătorește spre observator suferă o deplasare intensă spre albastru și o amplificare luminoasă la puterea a patra (δ⁴)."
  }
};
