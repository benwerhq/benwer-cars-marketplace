import { describe, expect, it } from "vitest";
import { ColorScheme } from "@/enums";
import {
  DEFAULT_COLOR_SCHEME,
  parseColorScheme,
  serverDarkClass,
  systemColorSchemeScript,
} from "./colorScheme";

describe("parseColorScheme", () => {
  it("accepts known schemes", () => {
    expect(parseColorScheme("dark")).toBe(ColorScheme.DARK);
    expect(parseColorScheme("light")).toBe(ColorScheme.LIGHT);
    expect(parseColorScheme("system")).toBe(ColorScheme.SYSTEM);
  });

  it("falls back to the default for missing or unknown values", () => {
    expect(parseColorScheme(undefined)).toBe(DEFAULT_COLOR_SCHEME);
    expect(parseColorScheme("")).toBe(DEFAULT_COLOR_SCHEME);
    expect(parseColorScheme("sepia")).toBe(DEFAULT_COLOR_SCHEME);
  });
});

describe("server rendering", () => {
  it("adds the dark class only for an explicit dark choice", () => {
    expect(serverDarkClass(ColorScheme.DARK)).toBe("dark");
    expect(serverDarkClass(ColorScheme.LIGHT)).toBe("");
    expect(serverDarkClass(ColorScheme.SYSTEM)).toBe("");
  });

  it("emits a pre-paint script only for the system scheme", () => {
    expect(systemColorSchemeScript(ColorScheme.LIGHT)).toBeNull();
    expect(systemColorSchemeScript(ColorScheme.DARK)).toBeNull();
    expect(systemColorSchemeScript(ColorScheme.SYSTEM)).toContain("prefers-color-scheme: dark");
  });
});
