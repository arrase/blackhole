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
    "spin": "Rotación (Spin Kerr)",
    "intensity": "Brillo do disco",
    "diskSpeed": "Velocidade do disco",
    "diskTemp": "Temperatura do disco",
    "glow": "Resplandor óptico",
    "stars": "Estrelas",
    "fov": "Zoom de lente",
    "autoRotate": "Rotación automática",
    "accretionDisk": "Disco de acreción"
  },
  "info": {
    "title": "A FÍSICA DETRÁS",
    "metricTitle": "Métrica de Kerr e Spin: ",
    "metricDesc": "simula un burato negro en rotación relativista. O xiro arrastra o propio tecido do espazo-tempo (efecto Lense-Thirring / frame dragging), achatando a sombra no lado que rota cara a nós para formar unha característica silueta en forma de \"D\".",
    "horizonTitle": "Horizonte e Ergosfera: ",
    "horizonDesc": "o horizonte de sucesos contráese co spin segundo r+ = M + √(M²-a²). Por fóra xorde a ergosfera, onde o arrastre obriga a toda a materia a orbitar a prol do xiro.",
    "iscoTitle": "Órbita circular estable (ISCO): ",
    "iscoDesc": "calculada coa fórmula de Bardeen-Press-Teukolsky. Ao aumentar o spin a 0.95, o bordo interior do disco pasa de 3.0 a 0.97, permitindo ao gas penetrar moito máis fondo e liberar unha enorme enerxía gravitatoria.",
    "lensingTitle": "Lente gravitatoria e Anel de fotóns: ",
    "lensingDesc": "cada raio trázase cara atrás por unha xeodésica nula exacta de Kerr (coordenadas de Kerr-Schild): o disco asoma por riba e por baixo da sombra, e as súas imaxes de orde superior forman o fino anel de fotóns.",
    "dopplerTitle": "Efecto Doppler e Beaming: ",
    "dopplerDesc": "a luz que vemos é a dun corpo negro a g·T, onde g combina o efecto Doppler e o desprazamento gravitacional cara ao vermello (intensidade bolométrica ∝ g⁴): o lado que se achega vese máis brillante e branco, e o que se afasta máis tenue e avermellado."
  }
};
