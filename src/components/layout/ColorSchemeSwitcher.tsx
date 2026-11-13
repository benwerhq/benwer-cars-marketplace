"use client";

import { useSyncExternalStore } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { ColorScheme } from "@/enums";
import {
  DEFAULT_COLOR_SCHEME,
  applyColorScheme,
  readColorSchemeCookie,
  subscribeToSystemScheme,
  writeColorSchemeCookie,
} from "@/lib/colorScheme";
import { cn } from "@/lib/utils";
import { HEADER_ICON_BUTTON, MENU_CONTENT, MENU_ITEM } from "./LocaleSwitcher";

const CHANGE_EVENT = "benwer:color-scheme";

const OPTIONS: ReadonlyArray<{ scheme: ColorScheme; icon: LucideIcon }> = [
  { scheme: ColorScheme.LIGHT, icon: Sun },
  { scheme: ColorScheme.DARK, icon: Moon },
  { scheme: ColorScheme.SYSTEM, icon: Monitor },
];

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  const stopSystem = subscribeToSystemScheme(() => {
    applyColorScheme(readColorSchemeCookie());
    onChange();
  });
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    stopSystem();
  };
}

function getServerSnapshot(): ColorScheme {
  return DEFAULT_COLOR_SCHEME;
}

interface ColorSchemeSwitcherProps {
  className?: string;
}

export function ColorSchemeSwitcher({ className }: ColorSchemeSwitcherProps) {
  const t = useTranslations("colorScheme");
  const current = useSyncExternalStore(subscribe, readColorSchemeCookie, getServerSnapshot);
  const CurrentIcon = OPTIONS.find((option) => option.scheme === current)?.icon ?? Sun;

  function select(next: ColorScheme) {
    writeColorSchemeCookie(next);
    applyColorScheme(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <DropdownMenu.Root modal={false}>
      <IconTooltip label={t("label")}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={t("label")}
            data-testid="color-scheme-switcher"
            className={cn(HEADER_ICON_BUTTON, className)}
          >
            <CurrentIcon size={16} aria-hidden />
          </button>
        </DropdownMenu.Trigger>
      </IconTooltip>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} className={MENU_CONTENT}>
          <DropdownMenu.RadioGroup
            value={current}
            onValueChange={(value) => select(value as ColorScheme)}
          >
            {OPTIONS.map(({ scheme, icon: Icon }) => {
              const active = current === scheme;
              return (
                <DropdownMenu.RadioItem
                  key={scheme}
                  value={scheme}
                  className={cn(MENU_ITEM, active ? "font-medium" : "text-muted-foreground")}
                >
                  <Icon size={14} className="shrink-0" aria-hidden />
                  <span className="flex-1">{t(scheme)}</span>
                  {active ? <Check size={14} className="shrink-0 text-primary" aria-hidden /> : null}
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
