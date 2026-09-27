import type { Translation } from "../types";

export const zh: Translation = {
  "title": "卡冈图雅 · 黑洞模拟",
  "subtitle": "超大质量黑洞 · 实时相对论物理模拟",
  "presets": {
    "cine": "星际穿越视角",
    "kerr": "克尔黑洞之影",
    "cerca": "近距离接近",
    "arriba": "俯瞰视角",
    "plano": "吸积盘平面"
  },
  "hud": "拖动以旋转视角 · 滚轮以缩放",
  "webglUnsupported": "您的浏览器不支持 WebGL",
  "buttons": {
    "info": "我看到的是什么？",
    "hideControls": "隐藏控制面板",
    "showControls": "控制面板",
    "close": "关闭"
  },
  "controls": {
    "quality": "画质",
    "qualityLevels": [
      "低",
      "中",
      "高"
    ],
    "spin": "自旋 (克尔自旋)",
    "intensity": "吸积盘亮度",
    "diskSpeed": "吸积盘转速",
    "diskTemp": "吸积盘温度",
    "glow": "光子环",
    "stars": "背景恒星",
    "fov": "镜头视角 (FOV)",
    "autoRotate": "自动旋转",
    "accretionDisk": "吸积盘"
  },
  "info": {
    "title": "背后的物理原理",
    "metricTitle": "克尔度规与自旋： ",
    "metricDesc": "模拟具有相对论性自旋的旋转黑洞。自旋会拖拽时空结构本身（冷泽-蒂林效应 / 参考系拖拽），使得朝向观察者旋转一侧的阴影变扁，形成标志性的“D”字形轮廓。",
    "horizonTitle": "事件视界与能层： ",
    "horizonDesc": "事件视界半径随自旋收缩，满足 r+ = M + √(M²-a²)。视界外侧为能层，参考系拖拽迫使该区域内的一切物质必须沿自旋方向旋转。",
    "iscoTitle": "最内层稳定圆轨道 (ISCO)： ",
    "iscoDesc": "基于巴丁-普雷斯-图科尔斯基公式计算。当自旋增至 0.95 时，吸积盘内边缘从 3.0 缩小至 0.95，气体得以深入引力势阱中心并释放巨额引力结合能。",
    "lensingTitle": "引力透镜与光子环： ",
    "lensingDesc": "光线沿零测地线传播，使用二阶辛韦尔莱（Verlet）算法实时积分并考虑引力磁场加速度效应。",
    "dopplerTitle": "多普勒效应与相对论聚束： ",
    "dopplerDesc": "朝向观察者运动的顺行气体受到极强的蓝移影响，并产生四次方量级的相对论辐射聚束增强（δ⁴）。"
  }
};
