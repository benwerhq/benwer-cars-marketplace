"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, Palette } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import {
  BACKGROUND_PRESETS,
  DEFAULT_BACKGROUND_PRESET_ID,
  THEME_PRESETS,
} from "@/data/themePresets";
import { StorageKeys } from "@/enums";
import {
  DEFAULT_PREVIEW_PRIMARY,
  EMPTY_THEME_PREVIEW,
  THEME_PREVIEW_VARIABLES,
  normalizeHexInput,
  parseThemePreview,
  serializeThemePreview,
  themePreviewVariables,
  type ThemePreviewChoice,
} from "@/lib/themePreview";
import { cn } from "@/lib/utils";

const THEME_PREVIEW_EVENT = "benwer-theme-preview-change";
const DEFAULT_BACKGROUND =
  BACKGROUND_PRESETS.find((preset) => preset.id === DEFAULT_BACKGROUND_PRESET_ID)
    ?.color ?? "#ffffff";

function applyChoice(choice: ThemePreviewChoice): void {
  const style = document.documentElement.style;
  THEME_PREVIEW_VARIABLES.forEach((name) => style.removeProperty(name));
  Object.entries(themePreviewVariables(choice)).forEach(([name, value]) =>
    style.setProperty(name, value),
  );
}

function readStored(): string | null {
  try {
    return window.localStorage.getItem(StorageKeys.THEME_PREVIEW);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_PREVIEW_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_PREVIEW_EVENT, onChange);
  };
}

function store(choice: ThemePreviewChoice): void {
  const value = serializeThemePreview(choice);
  try {
    if (value) {
      window.localStorage.setItem(StorageKeys.THEME_PREVIEW, value);
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
  const raw = useSyncExternalStore(subscribe, readStored, () => null);
  const choice = parseThemePreview(raw);

  useEffect(() => {
    applyChoice(parseThemePreview(raw));
    return () => applyChoice(EMPTY_THEME_PREVIEW);
  }, [raw]);

  const update = (patch: Partial<ThemePreviewChoice>) =>
    store({ ...choice, ...patch });

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
          collisionPadding={16}
          className="z-50 flex max-h-[calc(100dvh-6rem)] w-80 max-w-[calc(100vw-2rem)] flex-col gap-4 overflow-y-auto rounded-2xl border border-border bg-surface p-4 shadow-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t("title")}
              </p>
              <p className="text-xs text-muted-foreground">{t("hint")}</p>
            </div>
            <button
              type="button"
              onClick={() => store(EMPTY_THEME_PREVIEW)}
              className="cursor-pointer rounded-full px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("reset")}
            </button>
          </div>
          <ColorChoice
            title={t("primaryTitle")}
            pickerLabel={t("primaryPicker")}
            value={choice.primary}
            fallback={DEFAULT_PREVIEW_PRIMARY}
            presets={THEME_PRESETS.map((preset) => ({
              color: preset.primary,
              label: t(`presets.${preset.id}`),
            }))}
            onPick={(primary) => update({ primary })}
          />
          <ColorChoice
            title={t("backgroundTitle")}
            pickerLabel={t("backgroundPicker")}
            value={choice.background}
            fallback={DEFAULT_BACKGROUND}
            presets={BACKGROUND_PRESETS.map((preset) => ({
              color: preset.color,
              label: t(`backgrounds.${preset.id}`),
            }))}
            onPick={(background) => update({ background })}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

interface ColorChoiceProps {
  title: string;
  pickerLabel: string;
  value: string | null;
  fallback: string;
  presets: { color: string; label: string }[];
  onPick: (color: string) => void;
}

function ColorChoice({
  title,
  pickerLabel,
  value,
  fallback,
  presets,
  onPick,
}: ColorChoiceProps) {
  const t = useTranslations("themePreview");
  const inputId = useId();
  const hintId = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const current = value ?? fallback;
  const invalid = draft !== null && draft !== "" && !normalizeHexInput(draft);
  const activeLabel =
    presets.find((preset) => preset.color.toLowerCase() === current)?.label ??
    t("custom");

  function type(text: string) {
    setDraft(text);
    const color = normalizeHexInput(text);
    if (color) {
      onPick(color);
    }
  }

  return (
    <fieldset className="flex flex-col gap-2.5 border-t border-border pt-4">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-baseline justify-between gap-2">
        <p aria-hidden className="text-xs font-semibold tracking-wide text-foreground uppercase">
          {title}
        </p>
        <p className="truncate text-xs text-muted-foreground">{activeLabel}</p>
      </div>
      <div role="radiogroup" aria-label={title} className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const selected = preset.color.toLowerCase() === current;
          return (
            <button
              key={preset.color}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={preset.label}
              title={preset.label}
              onClick={() => {
                setDraft(null);
                onPick(preset.color);
              }}
              style={{ backgroundColor: preset.color }}
              className={cn(
                "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border-strong ring-offset-2 ring-offset-surface transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected && "ring-2 ring-foreground",
              )}
            >
              {selected ? (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-surface text-foreground">
                  <Check size={11} strokeWidth={3} aria-hidden />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input
          type="color"
          aria-label={pickerLabel}
          value={current}
          onChange={(event) => {
            setDraft(null);
            onPick(event.target.value);
          }}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border-strong bg-surface p-1"
        />
        <label htmlFor={inputId} className="sr-only">
          {t("hexLabel", { name: title })}
        </label>
        <Input
          id={inputId}
          value={draft ?? current}
          placeholder={fallback}
          maxLength={9}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={invalid || undefined}
          aria-describedby={hintId}
          onChange={(event) => type(event.target.value)}
          onBlur={() => setDraft(null)}
          className="font-mono uppercase"
        />
      </div>
      <p id={hintId} className={cn("text-xs", invalid ? "text-danger" : "text-muted-foreground")}>
        {invalid ? t("hexInvalid") : t("hexHint")}
      </p>
    </fieldset>
  );
}
