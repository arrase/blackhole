import type { Translation } from "../types";

export const ko: Translation = {
  "title": "가르강튀아 · 블랙홀 시뮬레이션",
  "subtitle": "초대질량 블랙홀 · 실시간 상대론적 시뮬레이션",
  "presets": {
    "cine": "인터스텔라 뷰",
    "kerr": "커 그림자",
    "cerca": "접근",
    "arriba": "상공에서 본 모습",
    "plano": "원반 평면"
  },
  "hud": "드래그하여 회전 · 스크롤하여 확대/축소",
  "webglUnsupported": "브라우저가 WebGL을 지원하지 않습니다",
  "buttons": {
    "info": "무엇을 보고 있나요?",
    "hideControls": "컨트롤 숨기기",
    "showControls": "컨트롤",
    "close": "닫기"
  },
  "controls": {
    "quality": "품질",
    "qualityLevels": [
      "낮음",
      "중간",
      "높음"
    ],
    "spin": "회전 (커 스핀)",
    "intensity": "강착원반 밝기",
    "diskSpeed": "원반 속도",
    "diskTemp": "원반 온도",
    "glow": "광자 고리",
    "stars": "배경 별빛",
    "fov": "렌즈 화각",
    "autoRotate": "자동 회전",
    "accretionDisk": "강착원반"
  },
  "info": {
    "title": "배경 물리 이론",
    "metricTitle": "커 계량 및 스핀: ",
    "metricDesc": "상대론적 회전 블랙홀을 시뮬레이션합니다. 회전이 시공간 자체를 끌어당겨(렌제-티링 효과 / 좌표계 끌림), 관측자 쪽으로 회전하는 쪽 그림자가 납작해져 특유의 'D'자형 실루엣을 형성합니다.",
    "horizonTitle": "사건의 지평선 및 에르고영역: ",
    "horizonDesc": "사건의 지평선은 스핀에 따라 r+ = M + √(M²-a²) 로 수축합니다. 바깥쪽에는 에르고영역이 형성되어 좌표계 끌림으로 인해 모든 물질이 회전 방향으로 공전하게 됩니다.",
    "iscoTitle": "최내각 안정 원궤도 (ISCO): ",
    "iscoDesc": "바딘-프레스-튜콜스키 공식으로 계산됩니다. 스핀이 0.95로 증가하면 원반 안쪽 경계가 3.0에서 0.95로 좁혀져 가스가 훨씬 깊숙이 침투하여 막대한 중력 에너지를 방출합니다.",
    "lensingTitle": "중력 렌즈 및 광자 고리: ",
    "lensingDesc": "각 광선은 중력자기 가속도를 반영하여 2차 심플렉틱 베를레(Verlet) 적분법으로 계산된 영측지선을 따라 이동합니다.",
    "dopplerTitle": "도플러 효과 및 상대론적 비밍: ",
    "dopplerDesc": "관측자를 향해 다가오는 순행 가스는 강한 청색 편이와 4제곱에 비례하는 상대론적 비밍 증폭(δ⁴)을 겪습니다."
  }
};
