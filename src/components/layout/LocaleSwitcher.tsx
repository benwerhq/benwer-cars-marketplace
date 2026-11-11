"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { setLocaleCookie } from "@/i18n/setLocale";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALE_SHORT_KEYS = {
  "en-GB": "en",
  "es-ES": "es",
  "pt-PT": "pt",
} as const;

const LOCALE_NAME_KEYS = {
  "en-GB": "enName",
  "es-ES": "esName",
  "pt-PT": "ptName",
} as const;

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const t = useTranslations("locale");
  const locale = useLocale();
  const router = useRouter();

  async function select(next: (typeof routing.locales)[number]) {
    if (next === locale) {
      return;
    }

    await setLocaleCookie(next);
    router.refresh();
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "flex items-center rounded-full border border-border bg-surface p-0.5",
        className,
      )}
    >
      {routing.locales.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            aria-label={t(LOCALE_NAME_KEYS[code])}
            onClick={() => {
              void select(code);
            }}
            className={cn(
              "cursor-pointer rounded-full px-2 py-1 text-xs font-medium transition-colors sm:px-2.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-surface-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(LOCALE_SHORT_KEYS[code])}
          </button>
        );
      })}
    </div>
  );
}
