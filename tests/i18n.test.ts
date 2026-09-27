import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  LANGUAGES,
  LANGUAGE_MAP,
  LanguageCode,
  detectLanguage,
  translations,
} from "../src/i18n";

describe("i18n system", () => {
  const codes = LANGUAGES.map((l) => l.code);

  it("includes at least 40 supported languages", () => {
    expect(LANGUAGES.length).toBeGreaterThanOrEqual(40);
  });

  it("has corresponding translations and metadata for all languages", () => {
    for (const lang of LANGUAGES) {
      expect(LANGUAGE_MAP[lang.code]).toBeDefined();
      expect(LANGUAGE_MAP[lang.code].code).toBe(lang.code);
      expect(LANGUAGE_MAP[lang.code].label).toBeTruthy();
      expect(["ltr", "rtl"]).toContain(LANGUAGE_MAP[lang.code].dir);

      const t = translations[lang.code];
      expect(t).toBeDefined();
      expect(t.title).toBeTruthy();
      expect(t.subtitle).toBeTruthy();
      expect(t.hud).toBeTruthy();
      expect(t.webglUnsupported).toBeTruthy();

      expect(t.presets.cine).toBeTruthy();
      expect(t.presets.kerr).toBeTruthy();
      expect(t.presets.cerca).toBeTruthy();
      expect(t.presets.arriba).toBeTruthy();
      expect(t.presets.plano).toBeTruthy();

      expect(t.buttons.info).toBeTruthy();
      expect(t.buttons.hideControls).toBeTruthy();
      expect(t.buttons.showControls).toBeTruthy();
      expect(t.buttons.close).toBeTruthy();

      expect(t.controls.quality).toBeTruthy();
      expect(t.controls.qualityLevels).toHaveLength(3);
      t.controls.qualityLevels.forEach((level) => expect(level).toBeTruthy());
      expect(t.controls.spin).toBeTruthy();
      expect(t.controls.intensity).toBeTruthy();
      expect(t.controls.diskSpeed).toBeTruthy();
      expect(t.controls.diskTemp).toBeTruthy();
      expect(t.controls.glow).toBeTruthy();
      expect(t.controls.stars).toBeTruthy();
      expect(t.controls.fov).toBeTruthy();
      expect(t.controls.autoRotate).toBeTruthy();

      expect(t.info.title).toBeTruthy();
      expect(t.info.metricTitle).toBeTruthy();
      expect(t.info.metricDesc).toBeTruthy();
      expect(t.info.horizonTitle).toBeTruthy();
      expect(t.info.horizonDesc).toBeTruthy();
      expect(t.info.iscoTitle).toBeTruthy();
      expect(t.info.iscoDesc).toBeTruthy();
      expect(t.info.lensingTitle).toBeTruthy();
      expect(t.info.lensingDesc).toBeTruthy();
      expect(t.info.dopplerTitle).toBeTruthy();
      expect(t.info.dopplerDesc).toBeTruthy();
    }
  });

  it("configures RTL direction for Arabic, Hebrew, Persian, and Urdu", () => {
    const rtlCodes: LanguageCode[] = ["ar", "he", "fa", "ur"];
    for (const code of rtlCodes) {
      expect(LANGUAGE_MAP[code].dir).toBe("rtl");
    }
    expect(LANGUAGE_MAP["es"].dir).toBe("ltr");
    expect(LANGUAGE_MAP["en"].dir).toBe("ltr");
  });

  describe("detectLanguage", () => {
    let storage: Record<string, string> = {};

    beforeEach(() => {
      storage = {};
      const mockLocalStorage = {
        getItem: (key: string) => (key in storage ? storage[key] : null),
        setItem: (key: string, value: string) => {
          storage[key] = value;
        },
        removeItem: (key: string) => {
          delete storage[key];
        },
        clear: () => {
          storage = {};
        },
      } as Storage;

      vi.stubGlobal("window", globalThis);
      vi.stubGlobal("localStorage", mockLocalStorage);
      vi.stubGlobal("navigator", { language: "en-US" });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("returns defaultCode when window is undefined", () => {
      vi.stubGlobal("window", undefined);
      expect(detectLanguage(codes, "es")).toBe("es");
    });

    it("returns saved language from localStorage if available and supported", () => {
      localStorage.setItem("blackhole_lang", "ja");
      expect(detectLanguage(codes)).toBe("ja");
    });

    it("detects browser language when localStorage is empty", () => {
      vi.stubGlobal("navigator", { language: "fr-FR" });
      expect(detectLanguage(codes)).toBe("fr");
    });

    it("falls back to default code when neither saved nor browser language matches", () => {
      vi.stubGlobal("navigator", { language: "xx-YY" });
      expect(detectLanguage(codes, "es")).toBe("es");
    });
  });
});
