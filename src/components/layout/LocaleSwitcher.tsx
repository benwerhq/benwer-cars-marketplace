"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { setLocaleCookie } from "@/i18n/setLocale";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALE_NAME_KEYS = {
  "en-GB": "enName",
  "es-ES": "esName",
  "pt-PT": "ptName",
} as const;

export const HEADER_ICON_BUTTON =
  "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const MENU_CONTENT =
  "z-[60] min-w-44 rounded-xl border border-border bg-surface p-1 shadow-lg";

export const MENU_ITEM =
  "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground outline-none transition-colors data-[highlighted]:bg-surface-hover";

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const t = useTranslations("locale");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function select(next: (typeof routing.locales)[number]) {
    if (next === locale) {
      return;
    }
    startTransition(async () => {
      await setLocaleCookie(next);
      router.refresh();
    });
  }

  return (
    <DropdownMenu.Root modal={false}>
      <IconTooltip label={t("label")}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            disabled={isPending}
            aria-label={t("label")}
            className={cn(HEADER_ICON_BUTTON, className)}
          >
            <Globe size={16} aria-hidden />
          </button>
        </DropdownMenu.Trigger>
      </IconTooltip>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} className={MENU_CONTENT}>
          {routing.locales.map((code) => {
            const active = locale === code;
            return (
              <DropdownMenu.Item
                key={code}
                lang={code}
                onSelect={() => select(code)}
                className={cn(MENU_ITEM, active ? "font-medium" : "text-muted-foreground")}
              >
                <span className="flex-1">{t(LOCALE_NAME_KEYS[code])}</span>
                {active ? <Check size={14} className="shrink-0 text-primary" aria-hidden /> : null}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
