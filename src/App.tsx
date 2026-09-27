import { useCallback, useRef, useState } from "react";
import BlackHole, { CameraState, SimSettings } from "./BlackHole";

const PRESETS: Record<string, { cam: CameraState; label: string }> = {
  cine: { label: "Vista Interstellar", cam: { theta: 1.2, phi: 0.12, dist: 22 } },
  kerr: { label: "Sombra de Kerr", cam: { theta: 0.0, phi: 0.08, dist: 14 } },
  cerca: { label: "Aproximación", cam: { theta: 0.6, phi: 0.14, dist: 9 } },
  arriba: { label: "Desde arriba", cam: { theta: 0.3, phi: 1.1, dist: 26 } },
  plano: { label: "Plano del disco", cam: { theta: 2.0, phi: 0.01, dist: 18 } },
};

function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex justify-between text-[11px] uppercase tracking-widest text-amber-100/70">
        <span>{label}</span>
        <span className="font-mono text-amber-200">{value.toFixed(2)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-amber-400"
      />
    </label>
  );
}

export default function App() {
  const camera = useRef<CameraState>({ ...PRESETS.cine.cam });
  const [fps, setFps] = useState(0);
  const [panel, setPanel] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [settings, setSettings] = useState<SimSettings>({
    intensity: 0.35,
    diskSpeed: 1.5,
    quality: 1,
    stars: 1,
    glow: 0.6,
    autoRotate: true,
    fov: 1.3,
    spin: 0.85,
  });
  const set = <K extends keyof SimSettings>(k: K, v: SimSettings[K]) => setSettings((s) => ({ ...s, [k]: v }));
  const onFps = useCallback((f: number) => setFps(f), []);

  const goTo = (key: string) => {
    const target = PRESETS[key].cam;
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
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white select-none">
      <BlackHole settings={settings} camera={camera} onFps={onFps} />

      {/* Título */}
      <div className="pointer-events-none absolute left-6 top-6 md:left-10 md:top-8">
        <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-amber-200/60">
          Agujero negro supermasivo · Simulación relativista en tiempo real
        </p>
      </div>

      {/* Barra inferior */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-2 px-4">
        {Object.entries(PRESETS).map(([k, p]) => (
          <button key={k} onClick={() => goTo(k)}
            className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs tracking-wider text-white/80 backdrop-blur-md transition hover:border-amber-300/60 hover:text-amber-200">
            {p.label}
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-5 left-6 hidden font-mono text-[10px] text-white/40 md:block">
        {fps} FPS · Arrastra para orbitar · Rueda para acercar
      </div>

      {/* Botones superiores */}
      <div className="absolute right-4 top-4 flex gap-2">
        <button onClick={() => setShowInfo((v) => !v)}
          className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white/80 backdrop-blur-md hover:text-amber-200">
          ¿Qué estoy viendo?
        </button>
        <button onClick={() => setPanel((v) => !v)}
          className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white/80 backdrop-blur-md hover:text-amber-200">
          {panel ? "Ocultar controles" : "Controles"}
        </button>
      </div>

      {/* Panel de controles */}
      {panel && (
        <div className="absolute right-4 top-16 w-64 space-y-4 rounded-2xl border border-white/10 bg-black/50 p-5 backdrop-blur-xl">
          <div>
            <div className="mb-2 text-[11px] uppercase tracking-widest text-amber-100/70">Calidad</div>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-white/5 p-1 text-xs">
              {["Baja", "Media", "Alta"].map((l, i) => (
                <button key={l} onClick={() => set("quality", i)}
                  className={`rounded-md py-1.5 transition ${settings.quality === i ? "bg-amber-400/90 text-black" : "text-white/70"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <Slider label="Rotación (Spin Kerr)" value={settings.spin} min={0} max={0.95} step={0.01} onChange={(v) => set("spin", v)} />
          <Slider label="Brillo del disco" value={settings.intensity} min={0.2} max={2.5} step={0.01} onChange={(v) => set("intensity", v)} />
          <Slider label="Velocidad del disco" value={settings.diskSpeed} min={0} max={6} step={0.01} onChange={(v) => set("diskSpeed", v)} />
          <Slider label="Anillo de fotones" value={settings.glow} min={0} max={2} step={0.01} onChange={(v) => set("glow", v)} />
          <Slider label="Estrellas" value={settings.stars} min={0} max={2} step={0.01} onChange={(v) => set("stars", v)} />
          <Slider label="Zoom de lente" value={settings.fov} min={0.8} max={3.5} step={0.01} onChange={(v) => set("fov", v)} />

          <label className="flex cursor-pointer items-center justify-between text-xs text-white/80">
            <span className="uppercase tracking-widest text-[11px] text-amber-100/70">Rotación automática</span>
            <input type="checkbox" checked={settings.autoRotate} onChange={(e) => set("autoRotate", e.target.checked)}
              className="h-4 w-4 accent-amber-400" />
          </label>
        </div>
      )}

      {/* Información */}
      {showInfo && (
        <div className="absolute left-6 top-32 max-w-sm space-y-3 rounded-2xl border border-white/10 bg-black/60 p-5 text-sm leading-relaxed text-white/75 backdrop-blur-xl">
          <h2 className="text-base font-light tracking-widest text-amber-200">LA FÍSICA DETRÁS</h2>
          <p><b className="text-white">Métrica de Kerr y Spin:</b> simula un agujero negro en rotación relativista. El giro arrastra el propio tejido del espaciotiempo (efecto Lense-Thirring / <i>frame dragging</i>), achatando la sombra en el lado que rota hacia nosotros para formar una característica silueta en forma de "D".</p>
          <p><b className="text-white">Horizonte y Ergosfera:</b> el horizonte de sucesos se contrae con el spin según $r_+ = M + \sqrt{M^2-a^2}$. Por fuera surge la ergosfera, donde el arrastre obliga a toda la materia a orbitar a favor del giro.</p>
          <p><b className="text-white">Órbita circular estable (ISCO):</b> calculada con la fórmula de Bardeen-Press-Teukolsky. Al aumentar el spin a $0.95$, el borde interior del disco pasa de $3.0$ a $0.95$, permitiendo al gas penetrar mucho más hondo y liberar enorme energía gravitatoria.</p>
          <p><b className="text-white">Lente gravitacional y Anillo de fotones:</b> cada rayo sigue geodésicas nulas integradas con Verlet simpléctico de 2º orden considerando la aceleración gravitomagnética.</p>
          <p><b className="text-white">Efecto Doppler y Beaming:</b> el gas prógrado que viaja hacia el observador sufre un intenso corrimiento al azul y amplificación luminosa cuártica ($\delta^4$).</p>
          <button onClick={() => setShowInfo(false)} className="text-xs text-amber-300 hover:underline">Cerrar</button>
        </div>
      )}
    </div>
  );
}
