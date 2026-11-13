import {
  THEME_PRESETS,
  type ThemePreset,
} from "@/data/themePresets";

export interface ThemePreviewChoice {
  primary: string | null;
  background: string | null;
}

export const EMPTY_THEME_PREVIEW: ThemePreviewChoice = {
  primary: null,
  background: null,
};

export const THEME_PREVIEW_VARIABLES = [
  "--primary",
  "--primary-hover",
  "--ring",
  "--accent",
  "--accent-hover",
  "--accent-soft",
  "--surface-hover",
  "--background",
] as const;

const SHORT_HEX = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const LONG_HEX = /^#?([0-9a-f]{6})$/i;

export function normalizeHexInput(raw: string): string | null {
  const value = raw.trim();
  const short = SHORT_HEX.exec(value);
  if (short) {
    const [, r, g, b] = short;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  const long = LONG_HEX.exec(value);
  return long ? `#${long[1]}`.toLowerCase() : null;
}

function presetForColor(color: string): ThemePreset | undefined {
  return THEME_PRESETS.find(
    (preset) => preset.primary.toLowerCase() === color.toLowerCase(),
  );
}

export function parseThemePreview(raw: string | null): ThemePreviewChoice {
  if (!raw) {
    return EMPTY_THEME_PREVIEW;
  }
  const legacyPreset = THEME_PRESETS.find((preset) => preset.id === raw);
  if (legacyPreset) {
    return { primary: legacyPreset.primary, background: null };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return EMPTY_THEME_PREVIEW;
    }
    const record = parsed as Record<string, unknown>;
    const read = (value: unknown) =>
      typeof value === "string" ? normalizeHexInput(value) : null;
    return { primary: read(record.primary), background: read(record.background) };
  } catch {
    return EMPTY_THEME_PREVIEW;
  }
}

export function serializeThemePreview(choice: ThemePreviewChoice): string | null {
  if (!choice.primary && !choice.background) {
    return null;
  }
  return JSON.stringify(choice);
}

export function themePreviewVariables(
  choice: ThemePreviewChoice,
): Partial<Record<(typeof THEME_PREVIEW_VARIABLES)[number], string>> {
  const variables: Partial<Record<(typeof THEME_PREVIEW_VARIABLES)[number], string>> = {};
  if (choice.primary) {
    const preset = presetForColor(choice.primary);
    const primary = choice.primary;
    const hover = preset?.primaryHover ?? `color-mix(in oklab, ${primary} 80%, black)`;
    const ring = preset?.ring ?? primary;
    variables["--primary"] = primary;
    variables["--primary-hover"] = hover;
    variables["--ring"] = ring;
    variables["--accent"] = ring;
    variables["--accent-hover"] = primary;
    variables["--accent-soft"] = `color-mix(in oklab, ${primary} 10%, transparent)`;
    variables["--surface-hover"] = `color-mix(in oklab, ${primary} 6%, white)`;
  }
  if (choice.background) {
    variables["--background"] = choice.background;
  }
  return variables;
}

export const DEFAULT_PREVIEW_PRIMARY = "#0d9488";
