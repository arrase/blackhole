import type { Translation } from "../types";

export const pt: Translation = {
  "title": "Gargantua · Simulação de Buraco Negro",
  "subtitle": "Buraco negro supermassivo · Simulação relativística em tempo real",
  "presets": {
    "cine": "Vista Interstellar",
    "kerr": "Sombra de Kerr",
    "cerca": "Aproximação",
    "arriba": "De cima",
    "plano": "Plano do disco"
  },
  "hud": "Arraste para orbitar · Role para aproximar",
  "webglUnsupported": "Seu navegador não suporta WebGL",
  "buttons": {
    "info": "O que estou vendo?",
    "hideControls": "Ocultar controles",
    "showControls": "Controles",
    "close": "Fechar"
  },
  "controls": {
    "quality": "Qualidade",
    "qualityLevels": [
      "Baixa",
      "Média",
      "Alta",
      "Ultra"
    ],
    "spin": "Rotação (Spin Kerr)",
    "intensity": "Brilho do disco",
    "diskSpeed": "Velocidade do disco",
    "glow": "Anel de fótons",
    "stars": "Estrelas",
    "fov": "Zoom da lente",
    "autoRotate": "Rotação automática"
  },
  "info": {
    "title": "A FÍSICA POR TRÁS",
    "metricTitle": "Métrica de Kerr e Spin: ",
    "metricDesc": "simula um buraco negro em rotação relativística. O giro arrasta a própria trama do espaço-tempo (efeito Lense-Thirring / frame dragging), achatando a sombra no lado que gira em nossa direção para formar uma silhueta em forma de \"D\".",
    "horizonTitle": "Horizonte e Ergosfera: ",
    "horizonDesc": "o horizonte de eventos se contrai com o spin conforme r+ = M + √(M²-a²). Do lado de fora surge a ergosfera, onde o arrasto obriga toda a matéria a orbitar a favor do giro.",
    "iscoTitle": "Órbita circular estável mais interna (ISCO): ",
    "iscoDesc": "calculada pela fórmula de Bardeen-Press-Teukolsky. Ao aumentar o spin para 0,95, a borda interna do disco passa de 3,0 para 0,95, permitindo que o gás mergulhe muito mais fundo e libere imensa energia gravitacional.",
    "lensingTitle": "Lente gravitacional e Anel de fótons: ",
    "lensingDesc": "cada raio segue geodésicas nulas integradas com Verlet simplético de 2ª ordem considerando a aceleração gravitomagnética.",
    "dopplerTitle": "Efeito Doppler e Beaming: ",
    "dopplerDesc": "o gás prógrado em direção ao observador sofre intenso desvio para o azul e amplificação luminosa quártica (δ⁴)."
  }
};
