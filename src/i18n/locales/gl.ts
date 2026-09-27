import type { Translation } from "../types";

export const gl: Translation = {
  "title": "Gargantua · Simulación de Burato Negro",
  "subtitle": "Burato negro supermasivo · Simulación relativista en tempo real",
  "presets": {
    "cine": "Vista Interstellar",
    "kerr": "Sombra de Kerr",
    "cerca": "Aproximación",
    "arriba": "Dende arriba",
    "plano": "Plano do disco"
  },
  "hud": "Arrastra para orbitar · Roda para achegar",
  "webglUnsupported": "O teu navegador non soporta WebGL",
  "buttons": {
    "info": "Que estou a ver?",
    "hideControls": "Ocultar controis",
    "showControls": "Controis",
    "close": "Pechar"
  },
  "controls": {
    "quality": "Calidade",
    "qualityLevels": [
      "Baixa",
      "Media",
      "Alta"
    ],
    "spin": "Rotación (Spin Kerr)",
    "intensity": "Brillo do disco",
    "diskSpeed": "Velocidade do disco",
    "glow": "Anel de fotóns",
    "stars": "Estrelas",
    "fov": "Zoom de lente",
    "autoRotate": "Rotación automática"
  },
  "info": {
    "title": "A FÍSICA DETRÁS",
    "metricTitle": "Métrica de Kerr e Spin: ",
    "metricDesc": "simula un burato negro en rotación relativista. O xiro arrastra o propio tecido do espazo-tempo (efecto Lense-Thirring / frame dragging), achatando a sombra no lado que rota cara a nós para formar unha característica silueta en forma de \"D\".",
    "horizonTitle": "Horizonte e Ergosfera: ",
    "horizonDesc": "o horizonte de sucesos contráese co spin segundo r+ = M + √(M²-a²). Por fóra xorde a ergosfera, onde o arrastre obriga a toda a materia a orbitar a prol do xiro.",
    "iscoTitle": "Órbita circular estable (ISCO): ",
    "iscoDesc": "calculada coa fórmula de Bardeen-Press-Teukolsky. Ao aumentar o spin a 0.95, o bordo interior do disco pasa de 3.0 a 0.95, permitindo ao gas penetrar moito máis fondo e liberar unha enorme enerxía gravitatoria.",
    "lensingTitle": "Lente gravitatoria e Anel de fotóns: ",
    "lensingDesc": "cada raio segue xeodésicas nulas integradas con Verlet simpléctico de 2º orde considerando a aceleración gravitomagnética.",
    "dopplerTitle": "Efecto Doppler e Beaming: ",
    "dopplerDesc": "o gas prógrado que viaxa cara ao observador sofre un intenso desprazamento cara ao azul e amplificación luminosa cuántica (δ⁴)."
  }
};
