import { describe, expect, it } from "vitest";
import {
  LOCALE_ENGLISH_NAMES,
  filterLocales,
  matchesLocaleQuery,
  normalizeLocaleQuery,
} from "./localeSearch";
import { routing, type AppLocale } from "./routing";

const NATIVE_SAMPLE: Partial<Record<AppLocale, string>> = {
  "cs-CZ": "Čeština",
  "el-GR": "Ελληνικά",
  "es-ES": "Español",
  "pt-PT": "Português",
  "de-DE": "Deutsch",
  "en-GB": "English",
};

describe("localeSearch", () => {
  it("defines an English name for every canonical EU locale", () => {
    for (const locale of routing.locales) {
      expect(LOCALE_ENGLISH_NAMES[locale]).toBeTruthy();
    }
  });

  it("normalizes case, whitespace, and diacritics", () => {
    expect(normalizeLocaleQuery("  Português  ")).toBe("portugues");
    expect(normalizeLocaleQuery("Čeština")).toBe("cestina");
    expect(normalizeLocaleQuery("Ελληνικά")).toBe("ελληνικα");
  });

  it("matches by native name, English name, and ISO/locale code", () => {
    expect(matchesLocaleQuery("es-ES", "Español", "espanol")).toBe(true);
    expect(matchesLocaleQuery("es-ES", "Español", "spanish")).toBe(true);
    expect(matchesLocaleQuery("es-ES", "Español", "es-ES")).toBe(true);
    expect(matchesLocaleQuery("el-GR", "Ελληνικά", "greek")).toBe(true);
    expect(matchesLocaleQuery("cs-CZ", "Čeština", "cest")).toBe(true);
    expect(matchesLocaleQuery("pt-PT", "Português", "german")).toBe(false);
  });

  it("filters locale lists and returns all locales on empty query", () => {
    const getName = (locale: AppLocale) => NATIVE_SAMPLE[locale] ?? LOCALE_ENGLISH_NAMES[locale];

    expect(filterLocales(routing.locales, getName, "")).toEqual(routing.locales);
    expect(filterLocales(routing.locales, getName, "   ")).toEqual(routing.locales);
    expect(filterLocales(routing.locales, getName, "portugues")).toEqual(["pt-PT"]);
    expect(filterLocales(routing.locales, getName, "gb")).toEqual(["en-GB"]);
    expect(filterLocales(routing.locales, getName, "zzz")).toEqual([]);
  });
});
