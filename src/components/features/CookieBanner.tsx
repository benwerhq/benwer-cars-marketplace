"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { NavRoutes, StorageKeys } from "@/enums";

type CookieChoice = "all" | "necessary";

export const COOKIE_SETTINGS_EVENT = "benwer:cookie-settings";

function readConsent(): CookieChoice | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(StorageKeys.COOKIE_CONSENT);
  return value === "all" || value === "necessary" ? value : null;
}

export function CookieBanner() {
  const t = useTranslations("cookieBanner");
  const [choice, setChoice] = useState<CookieChoice | null>(() =>
    readConsent(),
  );

  useEffect(() => {
    const reopen = () => setChoice(null);
    window.addEventListener(COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  if (choice !== null) {
    return null;
  }

  function accept(next: CookieChoice) {
    window.localStorage.setItem(StorageKeys.COOKIE_CONSENT, next);
    setChoice(next);
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-border bg-surface p-5 shadow-[0_24px_60px_-12px_color-mix(in_oklab,var(--foreground)_30%,transparent)] sm:inset-x-auto sm:left-6 sm:bottom-6 sm:w-[28rem]"
    >
      <div className="flex flex-col gap-4 pb-[env(safe-area-inset-bottom)]">
        <p id="cookie-banner-title" className="flex items-center gap-2 text-base font-semibold text-foreground">
          <ShieldCheck size={18} className="text-primary" aria-hidden />
          {t("title")}
        </p>
        <p className="-mt-2 text-sm text-muted-foreground">
          {t("body")}{" "}
          <Link
            href={NavRoutes.COOKIES}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            {t("policy")}
          </Link>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            className="min-h-11 w-full"
            onClick={() => accept("necessary")}
          >
            {t("necessary")}
          </Button>
          <Button
            className="min-h-11 w-full"
            onClick={() => accept("all")}
          >
            {t("accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === "all";
}
