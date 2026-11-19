import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [
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
  ],
  defaultLocale: "en-GB",
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];

export function isAppLocale(value: string): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value);
}

export function resolveLocale(value: string | undefined): AppLocale {
  if (value && isAppLocale(value)) {
    return value;
  }

  return routing.defaultLocale;
}
