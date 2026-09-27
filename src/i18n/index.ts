import type { LanguageCode, LanguageMeta } from "./types";

export * from "./types";
export { translations } from "./locales/index";

const LANGUAGE_ENTRIES: readonly [LanguageCode, string, "ltr" | "rtl"][] = [
  ["es", "Español", "ltr"],
  ["en", "English", "ltr"],
  ["ca", "Català", "ltr"],
  ["gl", "Galego", "ltr"],
  ["eu", "Euskara", "ltr"],
  ["fr", "Français", "ltr"],
  ["de", "Deutsch", "ltr"],
  ["it", "Italiano", "ltr"],
  ["pt", "Português", "ltr"],
  ["ru", "Русский", "ltr"],
  ["zh", "简体中文", "ltr"],
  ["ja", "日本語", "ltr"],
  ["ko", "한국어", "ltr"],
  ["ar", "العربية", "rtl"],
  ["hi", "हिन्दी", "ltr"],
  ["bn", "বাংলা", "ltr"],
  ["nl", "Nederlands", "ltr"],
  ["pl", "Polski", "ltr"],
  ["tr", "Türkçe", "ltr"],
  ["uk", "Українська", "ltr"],
  ["vi", "Tiếng Việt", "ltr"],
  ["id", "Bahasa Indonesia", "ltr"],
  ["sv", "Svenska", "ltr"],
  ["el", "Ελληνικά", "ltr"],
  ["cs", "Čeština", "ltr"],
  ["da", "Dansk", "ltr"],
  ["fi", "Suomi", "ltr"],
  ["no", "Norsk", "ltr"],
  ["hu", "Magyar", "ltr"],
  ["he", "עברית", "rtl"],
  ["th", "ไทย", "ltr"],
  ["ro", "Română", "ltr"],
  ["fa", "فارسی", "rtl"],
  ["ur", "اردو", "rtl"],
  ["sw", "Kiswahili", "ltr"],
  ["sk", "Slovenčina", "ltr"],
  ["bg", "Български", "ltr"],
  ["sr", "Srpski", "ltr"],
  ["hr", "Hrvatski", "ltr"],
  ["lt", "Lietuvių", "ltr"],
  ["lv", "Latviešu", "ltr"],
  ["et", "Eesti", "ltr"],
  ["sl", "Slovenščina", "ltr"],
  ["ms", "Bahasa Melayu", "ltr"],
  ["fil", "Filipino", "ltr"],
];

export const LANGUAGES: readonly LanguageMeta[] = LANGUAGE_ENTRIES.map(
  ([code, label, dir]) => ({ code, label, dir })
);

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
