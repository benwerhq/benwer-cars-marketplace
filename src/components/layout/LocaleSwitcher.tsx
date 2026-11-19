"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";
import { Check, Globe, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { filterLocales } from "@/i18n/localeSearch";
import { setLocaleCookie } from "@/i18n/setLocale";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { LocaleFlag } from "./LocaleFlag";

export type { AppLocale };

export const LOCALE_NAME_KEYS = {
  "bg-BG": "bgName",
  "cs-CZ": "csName",
  "da-DK": "daName",
  "de-DE": "deName",
  "el-GR": "elName",
  "en-GB": "enName",
  "es-ES": "esName",
  "et-EE": "etName",
  "fi-FI": "fiName",
  "fr-FR": "frName",
  "ga-IE": "gaName",
  "hr-HR": "hrName",
  "hu-HU": "huName",
  "it-IT": "itName",
  "lt-LT": "ltName",
  "lv-LV": "lvName",
  "mt-MT": "mtName",
  "nl-NL": "nlName",
  "pl-PL": "plName",
  "pt-PT": "ptName",
  "ro-RO": "roName",
  "sk-SK": "skName",
  "sl-SI": "slName",
  "sv-SE": "svName",
} as const satisfies Record<AppLocale, string>;

export const HEADER_ICON_BUTTON =
  "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const MENU_CONTENT =
  "z-[60] min-w-44 rounded-xl border border-border bg-surface p-1 shadow-lg";

export const MENU_ITEM =
  "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground outline-none transition-colors data-[highlighted]:bg-surface-hover";

interface LocaleSwitcherProps {
  className?: string;
}

export function useLocaleSelect() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function select(next: AppLocale) {
    if (next === locale) {
      return;
    }
    startTransition(async () => {
      await setLocaleCookie(next);
      router.refresh();
    });
  }

  return { locale, select, isPending };
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const t = useTranslations("locale");
  const { locale, select, isPending } = useLocaleSelect();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredLocales = useMemo(
    () => filterLocales(routing.locales, (code) => t(LOCALE_NAME_KEYS[code]), query),
    [query, t],
  );

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery("");
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <IconTooltip label={t("label")}>
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={isPending}
            aria-label={t("label")}
            className={cn(HEADER_ICON_BUTTON, className)}
          >
            <Globe size={16} aria-hidden />
          </button>
        </Popover.Trigger>
      </IconTooltip>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          collisionPadding={16}
          className="z-[60] w-[22rem] rounded-xl border border-border bg-surface p-2 shadow-lg outline-none sm:w-[26rem]"
        >
          <div className="relative">
            <Search
              size={15}
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("search")}
              aria-label={t("search")}
              className="h-9 w-full rounded-lg border border-border bg-background pr-3 pl-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div className="mt-2 max-h-[min(24rem,var(--radix-popover-content-available-height))] overflow-y-auto">
            {filteredLocales.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t("noResults")}</p>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {filteredLocales.map((code) => {
                  const active = locale === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      lang={code}
                      disabled={isPending}
                      aria-pressed={active}
                      onClick={() => {
                        select(code);
                        handleOpenChange(false);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
                        active
                          ? "bg-primary/10 font-medium text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <LocaleFlag locale={code} />
                      <span className="min-w-0 flex-1 truncate">{t(LOCALE_NAME_KEYS[code])}</span>
                      {active ? <Check size={14} className="shrink-0 text-primary" aria-hidden /> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
