import type { LanguageCode, LanguageMeta } from "./types";

export * from "./types";
export { translations } from "./locales/index";

export const LANGUAGES: readonly LanguageMeta[] = [
  {
    "code": "es",
    "label": "Español",
    "dir": "ltr"
  },
  {
    "code": "en",
    "label": "English",
    "dir": "ltr"
  },
  {
    "code": "ca",
    "label": "Català",
    "dir": "ltr"
  },
  {
    "code": "gl",
    "label": "Galego",
    "dir": "ltr"
  },
  {
    "code": "eu",
    "label": "Euskara",
    "dir": "ltr"
  },
  {
    "code": "fr",
    "label": "Français",
    "dir": "ltr"
  },
  {
    "code": "de",
    "label": "Deutsch",
    "dir": "ltr"
  },
  {
    "code": "it",
    "label": "Italiano",
    "dir": "ltr"
  },
  {
    "code": "pt",
    "label": "Português",
    "dir": "ltr"
  },
  {
    "code": "ru",
    "label": "Русский",
    "dir": "ltr"
  },
  {
    "code": "zh",
    "label": "简体中文",
    "dir": "ltr"
  },
  {
    "code": "ja",
    "label": "日本語",
    "dir": "ltr"
  },
  {
    "code": "ko",
    "label": "한국어",
    "dir": "ltr"
  },
  {
    "code": "ar",
    "label": "العربية",
    "dir": "rtl"
  },
  {
    "code": "hi",
    "label": "हिन्दी",
    "dir": "ltr"
  },
  {
    "code": "bn",
    "label": "বাংলা",
    "dir": "ltr"
  },
  {
    "code": "nl",
    "label": "Nederlands",
    "dir": "ltr"
  },
  {
    "code": "pl",
    "label": "Polski",
    "dir": "ltr"
  },
  {
    "code": "tr",
    "label": "Türkçe",
    "dir": "ltr"
  },
  {
    "code": "uk",
    "label": "Українська",
    "dir": "ltr"
  },
  {
    "code": "vi",
    "label": "Tiếng Việt",
    "dir": "ltr"
  },
  {
    "code": "id",
    "label": "Bahasa Indonesia",
    "dir": "ltr"
  },
  {
    "code": "sv",
    "label": "Svenska",
    "dir": "ltr"
  },
  {
    "code": "el",
    "label": "Ελληνικά",
    "dir": "ltr"
  },
  {
    "code": "cs",
    "label": "Čeština",
    "dir": "ltr"
  },
  {
    "code": "da",
    "label": "Dansk",
    "dir": "ltr"
  },
  {
    "code": "fi",
    "label": "Suomi",
    "dir": "ltr"
  },
  {
    "code": "no",
    "label": "Norsk",
    "dir": "ltr"
  },
  {
    "code": "hu",
    "label": "Magyar",
    "dir": "ltr"
  },
  {
    "code": "he",
    "label": "עברית",
    "dir": "rtl"
  },
  {
    "code": "th",
    "label": "ไทย",
    "dir": "ltr"
  },
  {
    "code": "ro",
    "label": "Română",
    "dir": "ltr"
  },
  {
    "code": "fa",
    "label": "فارسی",
    "dir": "rtl"
  },
  {
    "code": "ur",
    "label": "اردو",
    "dir": "rtl"
  },
  {
    "code": "sw",
    "label": "Kiswahili",
    "dir": "ltr"
  },
  {
    "code": "sk",
    "label": "Slovenčina",
    "dir": "ltr"
  },
  {
    "code": "bg",
    "label": "Български",
    "dir": "ltr"
  },
  {
    "code": "sr",
    "label": "Srpski",
    "dir": "ltr"
  },
  {
    "code": "hr",
    "label": "Hrvatski",
    "dir": "ltr"
  },
  {
    "code": "lt",
    "label": "Lietuvių",
    "dir": "ltr"
  },
  {
    "code": "lv",
    "label": "Latviešu",
    "dir": "ltr"
  },
  {
    "code": "et",
    "label": "Eesti",
    "dir": "ltr"
  },
  {
    "code": "sl",
    "label": "Slovenščina",
    "dir": "ltr"
  },
  {
    "code": "ms",
    "label": "Bahasa Melayu",
    "dir": "ltr"
  },
  {
    "code": "fil",
    "label": "Filipino",
    "dir": "ltr"
  }
] as const;

export const LANGUAGE_MAP: Record<LanguageCode, LanguageMeta> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l])
) as Record<LanguageCode, LanguageMeta>;

export function detectLanguage(availableCodes: readonly LanguageCode[], defaultCode: LanguageCode = "es"): LanguageCode {
  if (typeof window === "undefined") {
    return defaultCode;
  }
  const saved = localStorage.getItem("blackhole_lang");
  if (saved && (availableCodes as readonly string[]).includes(saved)) {
    return saved as LanguageCode;
  }
  const navLang = navigator.language.toLowerCase();
  const prefix = navLang.split("-")[0];
  const found = availableCodes.find((code) => code === navLang || code === prefix);
  if (found) {
    return found;
  }
  return defaultCode;
}
