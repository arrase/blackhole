import type { Translation } from "../types";

export const fr: Translation = {
  "title": "Gargantua · Simulation de Trou Noir",
  "subtitle": "Trou noir supermassif · Simulation relativiste en temps réel",
  "presets": {
    "cine": "Vue Interstellar",
    "kerr": "Ombre de Kerr",
    "cerca": "Approche rapprochée",
    "arriba": "Vue du dessus",
    "plano": "Plan du disque"
  },
  "hud": "Glisser pour orbiter · Défiler pour zoomer",
  "webglUnsupported": "Votre navigateur ne prend pas en charge WebGL",
  "buttons": {
    "info": "Que suis-je en train de voir ?",
    "hideControls": "Masquer les commandes",
    "showControls": "Commandes",
    "close": "Fermer"
  },
  "controls": {
    "quality": "Qualité",
    "qualityLevels": [
      "Basse",
      "Moyenne",
      "Haute"
    ],
    "spin": "Rotation (Spin de Kerr)",
    "intensity": "Luminosité du disque",
    "diskSpeed": "Vitesse du disque",
    "diskTemp": "Température du disque",
    "glow": "Anneau de photons",
    "stars": "Étoiles",
    "fov": "Zoom de l'objectif",
    "autoRotate": "Rotation automatique",
    "accretionDisk": "Disque d'accrétion"
  },
  "info": {
    "title": "LA PHYSIQUE SOUS-JACENTE",
    "metricTitle": "Métrique de Kerr et Spin : ",
    "metricDesc": "simule un trou noir en rotation relativiste. La rotation entraîne le tissu même de l'espace-temps (effet Lense-Thirring / frame dragging), aplatissant l'ombre du côté en rotation vers nous pour former une silhouette caractéristique en forme de « D ».",
    "horizonTitle": "Horizon et Ergosphère : ",
    "horizonDesc": "l'horizon des événements se contracte avec le spin selon r+ = M + √(M²-a²). À l'extérieur émerge l'ergosphère, où l'entraînement oblige toute la matière à orbiter dans le sens de la rotation.",
    "iscoTitle": "Orbite circulaire stable ultime (ISCO) : ",
    "iscoDesc": "calculée avec la formule de Bardeen-Press-Teukolsky. En augmentant le spin à 0,95, le bord interne du disque passe de 3,0 à 0,95, permettant au gaz de plonger beaucoup plus profondément et de libérer une gigantesque énergie gravitationnelle.",
    "lensingTitle": "Lentille gravitationnelle et Anneau de photons : ",
    "lensingDesc": "chaque rayon suit des géodésiques nulles intégrées par l'algorithme symplectique de Verlet au 2e ordre en prenant en compte l'accélération gravitomagnétique.",
    "dopplerTitle": "Effet Doppler et Amplification relativiste : ",
    "dopplerDesc": "le gaz prograde se déplaçant vers l'observateur subit un intense décalage vers le bleu et une amplification lumineuse quartique (δ⁴)."
  }
};
