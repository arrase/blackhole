import type { Translation } from "../types";

export const sl: Translation = {
  "title": "Gargantua · Simulacija črne luknje",
  "subtitle": "Supermasivna črna luknja · Relativistična simulacija v realnem času",
  "presets": {
    "cine": "Interstellar pogled",
    "kerr": "Kerrova senca",
    "cerca": "Približanje",
    "arriba": "Pogled od zgoraj",
    "plano": "Ravnina diska"
  },
  "hud": "Povlecite za vrtenje · Pomikajte za povečavo",
  "webglUnsupported": "Vaš brskalnik ne podpira WebGL",
  "buttons": {
    "info": "Kaj gledam?",
    "hideControls": "Skrij kontrolnike",
    "showControls": "Kontrolniki",
    "close": "Zapri"
  },
  "controls": {
    "spin": "Vrtenje (Kerrov spin)",
    "intensity": "Svetlost diska",
    "diskSpeed": "Hitrost diska",
    "diskTemp": "Temperatura diska",
    "glow": "Sij objektiva",
    "stars": "Zvezde",
    "fov": "Povečava objektiva",
    "autoRotate": "Samodejno vrtenje",
    "accretionDisk": "Akrecijski disk"
  },
  "info": {
    "title": "FIZIKALNO OZADJE",
    "metricTitle": "Kerrova metrika in spin: ",
    "metricDesc": "simulira črno luknjo z relativističnim vrtenjem. Vrtenje s seboj vleče samo tkanino prostor-časa (učinek Lense-Thirring), kar splošči senco na strani, ki se vrti proti nam, v obliko črke »D«.",
    "horizonTitle": "Dogodkovni horizont in Ergosfera: ",
    "horizonDesc": "dogodkovni horizont se krči s spinom po enačbi r+ = M + √(M²-a²). Zunaj nastane ergosfera, kjer vlačenje prisili vso snov, da kroži v smeri vrtenja.",
    "iscoTitle": "Najbolj notranja stabilna krožna orbita (ISCO): ",
    "iscoDesc": "izračunana po formuli Bardeen-Press-Teukolsky. Ob povečanju spina na 0.95 se notranji rob diska premakne s 3.0 na 0.97, kar plinu omogoča globlji padec in sprostitev ogromne gravitacijske energije.",
    "lensingTitle": "Gravitacijska leča in Fotonski obroč: ",
    "lensingDesc": "vsak žarek sledimo nazaj vzdolž natančne ničelne geodetke Kerrove metrike (Kerr-Schildove koordinate): disk se vidi nad in pod senco, njegove slike višjega reda pa tvorijo tanek fotonski obroč.",
    "dopplerTitle": "Dopplerjev pojav in Relativistično sevanje: ",
    "dopplerDesc": "svetloba, ki jo vidimo, je sevanje črnega telesa pri g·T, kjer g združuje Dopplerjev premik in gravitacijski rdeči premik (bolometrična jakost ∝ g⁴): stran, ki se nam približuje, je svetlejša in bolj bela, oddaljujoča se pa šibkejša in bolj rdeča."
  }
};
