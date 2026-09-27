import type { Translation } from "../types";

export const pl: Translation = {
  "title": "Gargantua · Symulacja Czarnej Dziury",
  "subtitle": "Supermasywna czarna dziura · Relatywistyczna symulacja w czasie rzeczywistym",
  "presets": {
    "cine": "Widok Interstellar",
    "kerr": "Cień Kerra",
    "cerca": "Zbliżenie",
    "arriba": "Widok z góry",
    "plano": "Płaszczyzna dysku"
  },
  "hud": "Przeciągnij, aby obrócić · Przewiń, aby przybliżyć",
  "webglUnsupported": "Twoja przeglądarka nie obsługuje WebGL",
  "buttons": {
    "info": "Co widzę?",
    "hideControls": "Ukryj elementy sterujące",
    "showControls": "Sterowanie",
    "close": "Zamknij"
  },
  "controls": {
    "quality": "Jakość",
    "qualityLevels": [
      "Niska",
      "Średnia",
      "Wysoka",
      "Ultra"
    ],
    "spin": "Rotacja (Spin Kerra)",
    "intensity": "Jasność dysku",
    "diskSpeed": "Prędkość dysku",
    "glow": "Pierścień fotonowy",
    "stars": "Gwiazdy",
    "fov": "Zoom soczewki",
    "autoRotate": "Automatyczny obrót"
  },
  "info": {
    "title": "FIZYKA ZJAWISKA",
    "metricTitle": "Metryka Kerra i spin: ",
    "metricDesc": "symuluje rotującą relatywistyczną czarną dziurę. Wirowanie pociąga samą czasoprzestrzeń (efekt Lensego-Thirringa / frame dragging), spłaszczając cień po stronie obracającej się w naszą stronę do charakterystycznego kształtu litery „D”.",
    "horizonTitle": "Horyzont zdarzeń i ergosfera: ",
    "horizonDesc": "horyzont zdarzeń kurczy się wraz ze spinem według r+ = M + √(M²-a²). Na zewnątrz powstaje ergosfera, w której pociąganie czasoprzestrzeni zmusza całą materię do rotacji w kierunku wirowania.",
    "iscoTitle": "Wewnętrzna stabilna orbita kołowa (ISCO): ",
    "iscoDesc": "wyliczana ze wzoru Bardeena-Pressa-Teukolsky'ego. Przy wzroście spinu do 0.95 wewnętrzna krawędź dysku przesuwa się z 3.0 do 0.95, pozwalając gazowi opadać znacznie głębiej i uwalniać potężną energię grawitacyjną.",
    "lensingTitle": "Soczewkowanie grawitacyjne i pierścień fotonowy: ",
    "lensingDesc": "każdy promień porusza się wzdłuż zerowych geodezyjnych całkowanych symplektycznym algorytmem Verleta 2. rzędu z uwzględnieniem przyspieszenia grawitomagnetycznego.",
    "dopplerTitle": "Efekt Dopplera i beaming: ",
    "dopplerDesc": "gaz progradacyjny poruszający się w stronę obserwatora doznaje silnego przesunięcia ku fioletowi i relatywistycznego wzmocnienia jasności do czwartej potęgi (δ⁴)."
  }
};
