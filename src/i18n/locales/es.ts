import type { Translation } from "../types";

export const es: Translation = {
  "title": "Gargantua · Simulación de Agujero Negro",
  "subtitle": "Agujero negro supermasivo · Simulación relativista en tiempo real",
  "presets": {
    "cine": "Vista Interstellar",
    "kerr": "Sombra de Kerr",
    "cerca": "Aproximación",
    "arriba": "Desde arriba",
    "plano": "Plano del disco"
  },
  "hud": "Arrastra para orbitar · Rueda para acercar",
  "webglUnsupported": "Tu navegador no soporta WebGL",
  "buttons": {
    "info": "¿Qué estoy viendo?",
    "hideControls": "Ocultar controles",
    "showControls": "Controles",
    "close": "Cerrar"
  },
  "controls": {
    "quality": "Calidad",
    "qualityLevels": [
      "Baja",
      "Media",
      "Alta"
    ],
    "spin": "Rotación (Spin Kerr)",
    "intensity": "Brillo del disco",
    "diskSpeed": "Velocidad del disco",
    "diskTemp": "Temperatura del disco",
    "glow": "Anillo de fotones",
    "stars": "Estrellas",
    "fov": "Zoom de lente",
    "autoRotate": "Rotación automática",
    "accretionDisk": "Disco de acreción"
  },
  "info": {
    "title": "LA FÍSICA DETRÁS",
    "metricTitle": "Métrica de Kerr y Spin: ",
    "metricDesc": "simula un agujero negro en rotación relativista. El giro arrastra el propio tejido del espaciotiempo (efecto Lense-Thirring / frame dragging), achatando la sombra en el lado que rota hacia nosotros para formar una característica silueta en forma de \"D\".",
    "horizonTitle": "Horizonte y Ergosfera: ",
    "horizonDesc": "el horizonte de sucesos se contrae con el spin según r+ = M + √(M²-a²). Por fuera surge la ergosfera, donde el arrastre obliga a toda la materia a orbitar a favor del giro.",
    "iscoTitle": "Órbita circular estable (ISCO): ",
    "iscoDesc": "calculada con la fórmula de Bardeen-Press-Teukolsky. Al aumentar el spin a 0.95, el borde interior del disco pasa de 3.0 a 0.95, permitiendo al gas penetrar mucho más hondo y liberar enorme energía gravitatoria.",
    "lensingTitle": "Lente gravitacional y Anillo de fotones: ",
    "lensingDesc": "cada rayo sigue geodésicas nulas integradas con Verlet simpléctico de 2º orden considerando la aceleración gravitomagnética.",
    "dopplerTitle": "Efecto Doppler y Beaming: ",
    "dopplerDesc": "el gas prógrado que viaja hacia el observador sufre un intenso corrimiento al azul y amplificación luminosa cuártica (δ⁴)."
  }
};
