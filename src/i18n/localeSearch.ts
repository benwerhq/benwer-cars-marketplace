import type { AppLocale } from "./routing";

export const LOCALE_ENGLISH_NAMES: Record<AppLocale, string> = {
  "bg-BG": "Bulgarian",
  "cs-CZ": "Czech",
  "da-DK": "Danish",
  "de-DE": "German",
  "el-GR": "Greek",
  "en-GB": "English",
  "es-ES": "Spanish",
  "et-EE": "Estonian",
  "fi-FI": "Finnish",
  "fr-FR": "French",
  "ga-IE": "Irish",
  "hr-HR": "Croatian",
  "hu-HU": "Hungarian",
  "it-IT": "Italian",
  "lt-LT": "Lithuanian",
  "lv-LV": "Latvian",
  "mt-MT": "Maltese",
  "nl-NL": "Dutch",
  "pl-PL": "Polish",
  "pt-PT": "Portuguese",
  "ro-RO": "Romanian",
  "sk-SK": "Slovak",
  "sl-SI": "Slovenian",
  "sv-SE": "Swedish",
};

export function normalizeLocaleQuery(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function matchesLocaleQuery(
  locale: AppLocale,
  nativeName: string,
  query: string,
): boolean {
  const normalized = normalizeLocaleQuery(query);
  if (!normalized) {
    return true;
  }

  return (
    normalizeLocaleQuery(nativeName).includes(normalized) ||
    normalizeLocaleQuery(LOCALE_ENGLISH_NAMES[locale]).includes(normalized) ||
    normalizeLocaleQuery(locale).includes(normalized)
  );
}

export function filterLocales(
  locales: readonly AppLocale[],
  getNativeName: (locale: AppLocale) => string,
  query: string,
): AppLocale[] {
  const normalized = normalizeLocaleQuery(query);
  if (!normalized) {
    return [...locales];
  }

  return locales.filter((locale) =>
    matchesLocaleQuery(locale, getNativeName(locale), normalized),
  );
}
