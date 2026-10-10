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
    "spin": "Rotação (Spin Kerr)",
    "intensity": "Brilho do disco",
    "diskSpeed": "Velocidade do disco",
    "diskTemp": "Temperatura do disco",
    "glow": "Brilho óptico",
    "stars": "Estrelas",
    "fov": "Zoom da lente",
    "autoRotate": "Rotação automática",
    "accretionDisk": "Disco de acreção"
  },
  "info": {
    "title": "A FÍSICA POR TRÁS",
    "metricTitle": "Métrica de Kerr e Spin: ",
    "metricDesc": "simula um buraco negro em rotação relativística. O giro arrasta a própria trama do espaço-tempo (efeito Lense-Thirring / frame dragging), achatando a sombra no lado que gira em nossa direção para formar uma silhueta em forma de \"D\".",
    "horizonTitle": "Horizonte e Ergosfera: ",
    "horizonDesc": "o horizonte de eventos se contrai com o spin conforme r+ = M + √(M²-a²). Do lado de fora surge a ergosfera, onde o arrasto obriga toda a matéria a orbitar a favor do giro.",
    "iscoTitle": "Órbita circular estável mais interna (ISCO): ",
    "iscoDesc": "calculada pela fórmula de Bardeen-Press-Teukolsky. Ao aumentar o spin para 0,95, a borda interna do disco passa de 3,0 para 0,97, permitindo que o gás mergulhe muito mais fundo e libere imensa energia gravitacional.",
    "lensingTitle": "Lente gravitacional e Anel de fótons: ",
    "lensingDesc": "cada raio é traçado para trás ao longo de uma geodésica nula exata de Kerr (coordenadas de Kerr-Schild): o disco aparece acima e abaixo da sombra, e suas imagens de ordem superior formam o fino anel de fótons.",
    "dopplerTitle": "Efeito Doppler e Beaming: ",
    "dopplerDesc": "a luz que vemos é a de um corpo negro a g·T, onde g combina o efeito Doppler e o desvio gravitacional para o vermelho (intensidade bolométrica ∝ g⁴): o lado que se aproxima parece mais brilhante e branco, e o que se afasta mais tênue e avermelhado."
  }
};
