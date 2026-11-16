"use client";

import { useTranslations } from "next-intl";
import { COOKIE_SETTINGS_EVENT } from "@/components/features/CookieBanner";

export function CookieSettingsLink({ className }: { className?: string }) {
  const t = useTranslations("cookieBanner");

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
      className={className}
    >
      {t("settings")}
    </button>
  );
}
