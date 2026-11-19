import { describe, expect, it } from "vitest";
import { getDateFnsLocale } from "@/lib/dates";
import { isAppLocale, resolveLocale, routing } from "./routing";

const CANONICAL_EU_LOCALES = [
  "bg-BG",
  "cs-CZ",
  "da-DK",
  "de-DE",
  "el-GR",
  "en-GB",
  "es-ES",
  "et-EE",
  "fi-FI",
  "fr-FR",
  "ga-IE",
  "hr-HR",
  "hu-HU",
  "it-IT",
  "lt-LT",
  "lv-LV",
  "mt-MT",
  "nl-NL",
  "pl-PL",
  "pt-PT",
  "ro-RO",
  "sk-SK",
  "sl-SI",
  "sv-SE",
] as const;

describe("i18n routing", () => {
  it("supports all 24 official EU locales", () => {
    expect(routing.locales).toEqual(CANONICAL_EU_LOCALES);
    expect(routing.defaultLocale).toBe("en-GB");
  });

  it("validates and resolves locales with fallback to default", () => {
    for (const locale of CANONICAL_EU_LOCALES) {
      expect(isAppLocale(locale)).toBe(true);
      expect(resolveLocale(locale)).toBe(locale);
    }

    expect(isAppLocale("xx-XX")).toBe(false);
    expect(resolveLocale("xx-XX")).toBe("en-GB");
    expect(resolveLocale(undefined)).toBe("en-GB");
  });

  it("resolves a date-fns locale for every supported locale", () => {
    for (const locale of CANONICAL_EU_LOCALES) {
      expect(getDateFnsLocale(locale)).toBeDefined();
    }
    expect(getDateFnsLocale("unknown")).toBe(getDateFnsLocale("en-GB"));
  });
});
