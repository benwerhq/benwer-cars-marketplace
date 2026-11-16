"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { ColorScheme } from "@/enums";
import {
  COLOR_SCHEME_CHANGE_EVENT,
  applyColorScheme,
  readColorSchemeCookie,
  resolveColorScheme,
  subscribeToSystemScheme,
  writeColorSchemeCookie,
} from "@/lib/colorScheme";
import { cn } from "@/lib/utils";
import { HEADER_ICON_BUTTON } from "./LocaleSwitcher";

function subscribe(onChange: () => void): () => void {
  window.addEventListener(COLOR_SCHEME_CHANGE_EVENT, onChange);
  const stopSystem = subscribeToSystemScheme(() => {
    applyColorScheme(resolveColorScheme(readColorSchemeCookie()));
    onChange();
  });
  return () => {
    window.removeEventListener(COLOR_SCHEME_CHANGE_EVENT, onChange);
    stopSystem();
  };
}

function getSnapshot(): ColorScheme {
  return resolveColorScheme(readColorSchemeCookie());
}

function getServerSnapshot(): ColorScheme | null {
  return null;
}

interface ColorSchemeSwitcherProps {
  className?: string;
}

export function useColorSchemeToggle() {
  const t = useTranslations("colorScheme");
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = current === ColorScheme.DARK;
  const label = isDark ? t("toLight") : t("toDark");

  function toggle() {
    const next = isDark ? ColorScheme.LIGHT : ColorScheme.DARK;
    writeColorSchemeCookie(next);
    applyColorScheme(next);
    window.dispatchEvent(new Event(COLOR_SCHEME_CHANGE_EVENT));
  }

  return { current, isDark, label, toggle };
}

export function ColorSchemeSwitcher({ className }: ColorSchemeSwitcherProps) {
  const { current, isDark, label, toggle } = useColorSchemeToggle();

  return (
    <IconTooltip label={label}>
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-pressed={current === null ? undefined : isDark}
        data-testid="color-scheme-switcher"
        className={cn(HEADER_ICON_BUTTON, className)}
      >
        {isDark ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
      </button>
    </IconTooltip>
  );
}
