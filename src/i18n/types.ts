export type PresetKey = "cine" | "kerr" | "cerca" | "arriba" | "plano";

export type LanguageCode =
  | "es"
  | "en"
  | "ca"
  | "gl"
  | "eu"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "ru"
  | "zh"
  | "ja"
  | "ko"
  | "ar"
  | "hi"
  | "bn"
  | "nl"
  | "pl"
  | "tr"
  | "uk"
  | "vi"
  | "id"
  | "sv"
  | "el"
  | "cs"
  | "da"
  | "fi"
  | "no"
  | "hu"
  | "he"
  | "th"
  | "ro"
  | "fa"
  | "ur"
  | "sw"
  | "sk"
  | "bg"
  | "sr"
  | "hr"
  | "lt"
  | "lv"
  | "et"
  | "sl"
  | "ms"
  | "fil";

export interface LanguageMeta {
  code: LanguageCode;
  label: string;
  dir: "ltr" | "rtl";
}

export interface Translation {
  title: string;
  subtitle: string;
  presets: Record<PresetKey, string>;
  hud: string;
  webglUnsupported: string;
  buttons: {
    info: string;
    hideControls: string;
    showControls: string;
    close: string;
  };
  controls: {
    quality: string;
    qualityLevels: [string, string, string];
    spin: string;
    intensity: string;
    diskSpeed: string;
    diskTemp: string;
    glow: string;
    stars: string;
    fov: string;
    autoRotate: string;
    accretionDisk: string;
  };
  info: {
    title: string;
    metricTitle: string;
    metricDesc: string;
    horizonTitle: string;
    horizonDesc: string;
    iscoTitle: string;
    iscoDesc: string;
    lensingTitle: string;
    lensingDesc: string;
    dopplerTitle: string;
    dopplerDesc: string;
  };
}
