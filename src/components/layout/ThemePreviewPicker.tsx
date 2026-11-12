"use client";

import { useEffect, useSyncExternalStore } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, Palette } from "lucide-react";
import { useTranslations } from "next-intl";
import { THEME_PRESETS, type ThemePreset } from "@/data/themePresets";
import { StorageKeys } from "@/enums";
import { cn } from "@/lib/utils";

const THEME_VARIABLES = [
  "--primary",
  "--primary-hover",
  "--ring",
  "--accent",
  "--accent-hover",
  "--accent-soft",
  "--surface-hover",
] as const;

function applyPreset(preset: ThemePreset | null): void {
  const style = document.documentElement.style;
  if (!preset) {
    THEME_VARIABLES.forEach((name) => style.removeProperty(name));
    return;
  }
  style.setProperty("--primary", preset.primary);
  style.setProperty("--primary-hover", preset.primaryHover);
  style.setProperty("--ring", preset.ring);
  style.setProperty("--accent", preset.ring);
  style.setProperty("--accent-hover", preset.primary);
  style.setProperty(
    "--accent-soft",
    `color-mix(in oklab, ${preset.primary} 10%, transparent)`,
  );
  style.setProperty(
    "--surface-hover",
    `color-mix(in oklab, ${preset.primary} 6%, white)`,
  );
}

function readStoredPreset(): string | null {
  try {
    return window.localStorage.getItem(StorageKeys.THEME_PREVIEW);
  } catch {
    return null;
  }
}

const THEME_PREVIEW_EVENT = "benwer-theme-preview-change";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_PREVIEW_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_PREVIEW_EVENT, onChange);
  };
}

function storePreset(id: string | null): void {
  try {
    if (id) {
      window.localStorage.setItem(StorageKeys.THEME_PREVIEW, id);
    } else {
      window.localStorage.removeItem(StorageKeys.THEME_PREVIEW);
    }
  } catch {
    return;
  }
  window.dispatchEvent(new Event(THEME_PREVIEW_EVENT));
}

export function ThemePreviewPicker() {
  const t = useTranslations("themePreview");
  const selected = useSyncExternalStore(
    subscribe,
    readStoredPreset,
    () => null,
  );

  useEffect(() => {
    applyPreset(THEME_PRESETS.find((preset) => preset.id === selected) ?? null);
    return () => applyPreset(null);
  }, [selected]);

  function choose(id: string | null) {
    storePreset(id);
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={t("open")}
          className="fixed right-4 bottom-4 z-50 inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-primary shadow-lg transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Palette size={20} aria-hidden />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="end"
          sideOffset={10}
          className="z-50 w-72 rounded-2xl border border-border bg-surface p-3 shadow-xl"
        >
          <div className="flex items-start justify-between gap-3 px-1 pb-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t("title")}
              </p>
              <p className="text-xs text-muted-foreground">{t("hint")}</p>
            </div>
            <button
              type="button"
              onClick={() => choose(null)}
              className="cursor-pointer rounded-full px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("reset")}
            </button>
          </div>
          <ul className="flex flex-col gap-0.5">
            {THEME_PRESETS.map((preset) => {
              const active = preset.id === selected;
              return (
                <li key={preset.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => choose(preset.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active && "bg-surface-muted font-medium",
                    )}
                  >
                    <span
                      aria-hidden
                      className="h-6 w-6 shrink-0 rounded-full border border-border"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {t(preset.id)}
                    </span>
                    {active ? (
                      <Check
                        size={16}
                        className="text-foreground"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
