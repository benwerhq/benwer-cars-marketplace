export interface BackgroundPreset {
  id: string;
  color: string;
}

export const BACKGROUND_PRESETS: readonly BackgroundPreset[] = [
  { id: "white", color: "#ffffff" },
  { id: "stone", color: "#fafaf9" },
  { id: "slate", color: "#f8fafc" },
  { id: "sand", color: "#f5f5f4" },
  { id: "mint", color: "#f0fdfa" },
  { id: "cream", color: "#fdf8f0" },
];
