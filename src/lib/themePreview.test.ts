import { describe, expect, it } from "vitest";
import {
  EMPTY_THEME_PREVIEW,
  normalizeHexInput,
  parseThemePreview,
  serializeThemePreview,
  themePreviewVariables,
} from "./themePreview";

describe("normalizeHexInput", () => {
  it("accepts pasted colours with or without a hash", () => {
    expect(normalizeHexInput("#0E7490")).toBe("#0e7490");
    expect(normalizeHexInput(" 0e7490 ")).toBe("#0e7490");
    expect(normalizeHexInput("#abc")).toBe("#aabbcc");
  });

  it("rejects anything that is not a hex colour", () => {
    expect(normalizeHexInput("")).toBeNull();
    expect(normalizeHexInput("#12345")).toBeNull();
    expect(normalizeHexInput("red")).toBeNull();
  });
});

describe("parseThemePreview", () => {
  it("reads the colours saved by the picker", () => {
    const saved = serializeThemePreview({ primary: "#1d4ed8", background: "#fdf8f0" });
    expect(parseThemePreview(saved)).toEqual({ primary: "#1d4ed8", background: "#fdf8f0" });
  });

  it("keeps a preset id saved by the older picker", () => {
    expect(parseThemePreview("ocean")).toEqual({ primary: "#1d4ed8", background: null });
  });

  it("ignores broken values", () => {
    expect(parseThemePreview("{oops")).toEqual(EMPTY_THEME_PREVIEW);
    expect(parseThemePreview(JSON.stringify({ primary: "blue" }))).toEqual(EMPTY_THEME_PREVIEW);
  });

  it("stores nothing when both colours are default", () => {
    expect(serializeThemePreview(EMPTY_THEME_PREVIEW)).toBeNull();
  });
});

describe("themePreviewVariables", () => {
  it("uses the preset hover colour for a preset", () => {
    const vars = themePreviewVariables({ primary: "#1d4ed8", background: null });
    expect(vars["--primary-hover"]).toBe("#1e40af");
    expect(vars["--preview-page-background"]).toBeUndefined();
  });

  it("derives hover and ring for a custom colour and sets the background", () => {
    const vars = themePreviewVariables({ primary: "#123456", background: "#fafaf9" });
    expect(vars["--primary-hover"]).toContain("#123456");
    expect(vars["--ring"]).toBe("#123456");
    expect(vars["--preview-page-background"]).toBe("#fafaf9");
  });
});
