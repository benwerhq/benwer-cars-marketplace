"use client";

import { useEffect, useSyncExternalStore } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, SwatchBook } from "lucide-react";
import { useTranslations } from "next-intl";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { ColorScheme, DarkPalette, StorageKeys } from "@/enums";
import {
  COLOR_SCHEME_CHANGE_EVENT,
  applyColorScheme,
  writeColorSchemeCookie,
} from "@/lib/colorScheme";
import { cn } from "@/lib/utils";
import { HEADER_ICON_BUTTON, MENU_CONTENT, MENU_ITEM } from "./LocaleSwitcher";

const PALETTE_EVENT = "benwer:dark-palette";

function readPalette(): DarkPalette {
  try {
    const stored = window.localStorage.getItem(StorageKeys.DARK_PALETTE);
    return Object.values(DarkPalette).includes(stored as DarkPalette)
      ? (stored as DarkPalette)
      : DarkPalette.STONE;
  } catch {
    return DarkPalette.STONE;
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(PALETTE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PALETTE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getServerSnapshot(): DarkPalette {
  return DarkPalette.STONE;
}

function applyPalette(palette: DarkPalette): void {
  if (palette === DarkPalette.STONE) {
    document.documentElement.removeAttribute("data-dark-palette");
  } else {
    document.documentElement.setAttribute("data-dark-palette", palette);
  }
}

export function DarkPalettePreview() {
  const t = useTranslations("darkPalette");
  const current = useSyncExternalStore(subscribe, readPalette, getServerSnapshot);

  useEffect(() => {
    applyPalette(current);
  }, [current]);

  function select(palette: DarkPalette) {
    try {
      window.localStorage.setItem(StorageKeys.DARK_PALETTE, palette);
    } catch {
      applyPalette(palette);
    }
    writeColorSchemeCookie(ColorScheme.DARK);
    applyColorScheme(ColorScheme.DARK);
    window.dispatchEvent(new Event(PALETTE_EVENT));
    window.dispatchEvent(new Event(COLOR_SCHEME_CHANGE_EVENT));
  }

  return (
    <div className="fixed bottom-20 left-4 z-50">
      <DropdownMenu.Root modal={false}>
        <IconTooltip label={t("label")}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={t("label")}
              data-testid="dark-palette-preview"
              className={cn(HEADER_ICON_BUTTON, "h-11 w-11 shadow-lg")}
            >
              <SwatchBook size={18} aria-hidden />
            </button>
          </DropdownMenu.Trigger>
        </IconTooltip>
        <DropdownMenu.Portal>
          <DropdownMenu.Content side="top" align="start" sideOffset={8} className={MENU_CONTENT}>
            <DropdownMenu.Label className="px-2.5 pt-1.5 text-xs font-medium text-foreground">
              {t("label")}
            </DropdownMenu.Label>
            <p className="px-2.5 pb-1.5 text-xs text-muted-foreground">{t("hint")}</p>
            <DropdownMenu.RadioGroup
              value={current}
              onValueChange={(value) => select(value as DarkPalette)}
            >
              {Object.values(DarkPalette).map((palette) => {
                const active = current === palette;
                return (
                  <DropdownMenu.RadioItem
                    key={palette}
                    value={palette}
                    className={cn(MENU_ITEM, active ? "font-medium" : "text-muted-foreground")}
                  >
                    <span className="flex-1">{t(palette)}</span>
                    {active ? (
                      <Check size={14} className="shrink-0 text-primary" aria-hidden />
                    ) : null}
                  </DropdownMenu.RadioItem>
                );
              })}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
