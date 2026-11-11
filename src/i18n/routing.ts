import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en-GB", "es-ES", "pt-PT"],
  defaultLocale: "en-GB",
  localeDetection: false,
});
