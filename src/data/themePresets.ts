export interface ThemePreset {
  id: string;
  primary: string;
  primaryHover: string;
  ring: string;
}

export const ADMIN_THEME_PRESET_ID = "admin";

export const THEME_PRESETS: readonly ThemePreset[] = [
  {
    id: ADMIN_THEME_PRESET_ID,
    primary: "#0e7490",
    primaryHover: "#155e75",
    ring: "#0891b2",
  },
  { id: "teal", primary: "#0d9488", primaryHover: "#0f766e", ring: "#0d9488" },
  { id: "ocean", primary: "#1d4ed8", primaryHover: "#1e40af", ring: "#3b82f6" },
  {
    id: "indigo",
    primary: "#4f46e5",
    primaryHover: "#4338ca",
    ring: "#6366f1",
  },
  {
    id: "violet",
    primary: "#7c3aed",
    primaryHover: "#6d28d9",
    ring: "#8b5cf6",
  },
  {
    id: "emerald",
    primary: "#047857",
    primaryHover: "#065f46",
    ring: "#10b981",
  },
  {
    id: "forest",
    primary: "#032d2e",
    primaryHover: "#0b4a4b",
    ring: "#0d9488",
  },
  {
    id: "sunset",
    primary: "#c2410c",
    primaryHover: "#9a3412",
    ring: "#f97316",
  },
  { id: "rose", primary: "#be123c", primaryHover: "#9f1239", ring: "#f43f5e" },
  { id: "ink", primary: "#0f172a", primaryHover: "#1e293b", ring: "#475569" },
];

export interface BackgroundPreset {
  id: string;
  color: string;
}

export const DEFAULT_BACKGROUND_PRESET_ID = "white";

export const BACKGROUND_PRESETS: readonly BackgroundPreset[] = [
  { id: DEFAULT_BACKGROUND_PRESET_ID, color: "#ffffff" },
  { id: "stone", color: "#fafaf9" },
  { id: "slate", color: "#f8fafc" },
  { id: "sand", color: "#f5f5f4" },
  { id: "mint", color: "#f0fdfa" },
  { id: "cream", color: "#fdf8f0" },
];
