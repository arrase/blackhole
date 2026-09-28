import { useCallback, useEffect, useRef, useState } from "react";
import BlackHole, { CameraState, SimSettings } from "./BlackHole";
import {
  LANGUAGES,
  LANGUAGE_MAP,
  LanguageCode,
  PresetKey,
  detectLanguage,
  translations,
} from "./i18n";

const ALLOWED_LANGUAGES = [
  "es", "en", "ca", "gl", "eu", "fr", "de", "it", "pt", "ru",
  "zh", "ja", "ko", "ar", "hi", "bn", "nl", "pl", "tr", "uk",
  "vi", "id", "sv", "el", "cs", "da", "fi", "no", "hu", "he",
  "th", "ro", "fa", "ur", "sw", "sk", "bg", "sr", "hr", "lt",
  "lv", "et", "sl", "ms", "fil",
] as const;

const PRESET_CAMERAS: Record<PresetKey, CameraState> = {
  cine: { theta: 1.2, phi: 0.12, dist: 22 },
  kerr: { theta: 0.0, phi: 0.08, dist: 14 },
  cerca: { theta: 0.6, phi: 0.14, dist: 9 },
  arriba: { theta: 0.3, phi: 1.1, dist: 26 },
  plano: { theta: 2.0, phi: 0.01, dist: 18 },
};

interface SliderProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly onChange: (v: number) => void;
}

function Slider({ label, value, min, max, step, onChange }: Readonly<SliderProps>) {
  const id = `slider-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="block">
      <div className="mb-1 flex justify-between text-[11px] uppercase tracking-widest text-amber-100/70">
        <label htmlFor={id}>{label}</label>
        <span className="font-mono text-amber-200">{value.toFixed(2)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        className="w-full accent-amber-400"
      />
    </div>
  );
}

export default function App() {
  const camera = useRef<CameraState>({ ...PRESET_CAMERAS.cine });
  const [lang, setLang] = useState<LanguageCode>(() =>
    detectLanguage(LANGUAGES.map((l) => l.code))
  );
  const [fps, setFps] = useState(0);
  const [panel, setPanel] = useState(() => typeof window !== "undefined" && window.innerWidth >= 768);
  const [showInfo, setShowInfo] = useState(false);
  const [settings, setSettings] = useState<SimSettings>({
    intensity: 0.35,
    diskSpeed: 1.5,
    diskTemp: 1.75,
    quality: 1,
    stars: 1,
    glow: 0.6,
    autoRotate: true,
    fov: 1.3,
    spin: 0.85,
    accretionDisk: true,
  });

  const t = translations[lang];
  const langMeta = LANGUAGE_MAP[lang];

  useEffect(() => {
    document.title = t.title;
    document.documentElement.lang = lang;
    document.documentElement.dir = langMeta.dir;
  }, [lang, t.title, langMeta.dir]);

  const handleLanguageChange = (selected: string) => {
    if (!ALLOWED_LANGUAGES.includes(selected as LanguageCode)) {
      return;
    }
    const safeCode = selected as LanguageCode;
    setLang(safeCode);
    localStorage.setItem("blackhole_lang", safeCode);
  };

  const set = <K extends keyof SimSettings>(k: K, v: SimSettings[K]) => setSettings((s) => ({ ...s, [k]: v }));
  const onFps = useCallback((f: number) => setFps(f), []);

  const goTo = (key: PresetKey) => {
    const target = PRESET_CAMERAS[key];
    const from = { ...camera.current };
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 1800);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      camera.current.theta = from.theta + (target.theta - from.theta) * e;
      camera.current.phi = from.phi + (target.phi - from.phi) * e;
      camera.current.dist = from.dist + (target.dist - from.dist) * e;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-white select-none">
      <BlackHole settings={settings} camera={camera} onFps={onFps} webglUnsupportedMessage={t.webglUnsupported} />

      {/* Barra superior */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3.5 sm:p-5 md:px-8 md:py-6 pointer-events-none pt-[max(0.875rem,env(safe-area-inset-top))]">
        <div className="pointer-events-none min-w-0 pr-2">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.35em] text-amber-200/70 truncate font-light">
            {t.subtitle}
          </p>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          <select
            value={lang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            aria-label="Language"
            className="rounded-lg border border-white/15 bg-black/60 px-2 sm:px-2.5 py-1.5 sm:py-2 text-[11px] sm:text-xs text-white/90 backdrop-blur-md hover:border-amber-300/60 hover:text-amber-200 cursor-pointer outline-none transition"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-neutral-900 text-white">
                {l.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            aria-label={t.buttons.info}
            title={t.buttons.info}
            className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/50 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs text-white/80 backdrop-blur-md hover:border-amber-300/60 hover:text-amber-200 transition active:scale-95 cursor-pointer"
          >
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden md:inline">{t.buttons.info}</span>
          </button>

          <button
            type="button"
            onClick={() => setPanel((v) => !v)}
            aria-label={panel ? t.buttons.hideControls : t.buttons.showControls}
            title={panel ? t.buttons.hideControls : t.buttons.showControls}
            className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/50 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs text-white/80 backdrop-blur-md hover:border-amber-300/60 hover:text-amber-200 transition active:scale-95 cursor-pointer"
          >
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="hidden md:inline">{panel ? t.buttons.hideControls : t.buttons.showControls}</span>
          </button>
        </div>
      </header>

      {/* Barra inferior */}
      <div className="absolute bottom-6 sm:bottom-8 inset-x-0 flex justify-center px-3 sm:px-4 z-10 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 max-w-full">
          {(Object.keys(PRESET_CAMERAS) as PresetKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => goTo(k)}
              className="whitespace-nowrap rounded-full border border-white/15 bg-black/50 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs tracking-wider text-white/80 backdrop-blur-md transition hover:border-amber-300/60 hover:text-amber-200 active:scale-95 shrink-0 cursor-pointer"
            >
              {t.presets[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-6 hidden font-mono text-[10px] text-white/40 md:block">
        {fps} FPS · {t.hud}
      </div>

      {/* Panel de controles */}
      {panel && (
        <div className="fixed sm:absolute top-14 sm:top-16 right-3 sm:right-4 left-3 sm:left-auto sm:w-72 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-2xl border border-white/10 bg-black/75 p-4 sm:p-5 backdrop-blur-xl z-30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-[11px] uppercase tracking-widest text-amber-200 font-medium">
              {t.buttons.showControls}
            </span>
            <button
              type="button"
              onClick={() => setPanel(false)}
              aria-label={t.buttons.close}
              className="rounded p-1 text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <div className="mb-2 text-[11px] uppercase tracking-widest text-amber-100/70">{t.controls.quality}</div>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-white/5 p-1 text-xs">
              {t.controls.qualityLevels.map((l, i) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => set("quality", i)}
                  className={`rounded-md py-1.5 transition cursor-pointer ${settings.quality === i ? "bg-amber-400/90 text-black font-medium" : "text-white/70 hover:text-white"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <Slider label={t.controls.spin} value={settings.spin} min={0} max={0.95} step={0.01} onChange={(v) => set("spin", v)} />
          <Slider label={t.controls.intensity} value={settings.intensity} min={0.2} max={2.5} step={0.01} onChange={(v) => set("intensity", v)} />
          <Slider label={t.controls.diskSpeed} value={settings.diskSpeed} min={0} max={6} step={0.01} onChange={(v) => set("diskSpeed", v)} />
          <Slider label={t.controls.diskTemp} value={settings.diskTemp} min={0.3} max={3} step={0.01} onChange={(v) => set("diskTemp", v)} />
          <Slider label={t.controls.glow} value={settings.glow} min={0} max={2} step={0.01} onChange={(v) => set("glow", v)} />
          <Slider label={t.controls.stars} value={settings.stars} min={0} max={2} step={0.01} onChange={(v) => set("stars", v)} />
          <Slider label={t.controls.fov} value={settings.fov} min={0.8} max={3.5} step={0.01} onChange={(v) => set("fov", v)} />

          <label className="flex cursor-pointer items-center justify-between text-xs text-white/80 py-1">
            <span className="uppercase tracking-widest text-[11px] text-amber-100/70">{t.controls.accretionDisk}</span>
            <input
              type="checkbox"
              checked={settings.accretionDisk}
              onChange={(e) => set("accretionDisk", e.target.checked)}
              className="h-4 w-4 accent-amber-400 cursor-pointer"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between text-xs text-white/80 py-1">
            <span className="uppercase tracking-widest text-[11px] text-amber-100/70">{t.controls.autoRotate}</span>
            <input
              type="checkbox"
              checked={settings.autoRotate}
              onChange={(e) => set("autoRotate", e.target.checked)}
              className="h-4 w-4 accent-amber-400 cursor-pointer"
            />
          </label>
        </div>
      )}

      {/* Información */}
      {showInfo && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={t.buttons.close}
            tabIndex={-1}
            onClick={() => setShowInfo(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-default"
          />
          <div className="relative w-full max-w-md max-h-[85dvh] flex flex-col rounded-2xl border border-white/10 bg-black/80 p-5 sm:p-6 text-sm leading-relaxed text-white/75 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <h2 id="info-dialog-title" className="text-base font-light tracking-widest text-amber-200">{t.info.title}</h2>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                aria-label={t.buttons.close}
                className="rounded-lg p-1 text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto space-y-3 py-3 pr-1 text-xs sm:text-sm">
              <p><b className="text-white">{t.info.metricTitle}</b>{t.info.metricDesc}</p>
              <p><b className="text-white">{t.info.horizonTitle}</b>{t.info.horizonDesc}</p>
              <p><b className="text-white">{t.info.iscoTitle}</b>{t.info.iscoDesc}</p>
              <p><b className="text-white">{t.info.lensingTitle}</b>{t.info.lensingDesc}</p>
              <p><b className="text-white">{t.info.dopplerTitle}</b>{t.info.dopplerDesc}</p>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-1.5 text-xs text-amber-300 font-medium transition cursor-pointer"
              >
                {t.buttons.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
