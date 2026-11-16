import { describe, expect, it } from "vitest";
import { ColorScheme } from "@/enums";
import { parseColorScheme, serverDarkClass, systemColorSchemeScript } from "./colorScheme";

describe("parseColorScheme", () => {
  it("accepts an explicit light or dark choice", () => {
    expect(parseColorScheme("dark")).toBe(ColorScheme.DARK);
    expect(parseColorScheme("light")).toBe(ColorScheme.LIGHT);
  });

  it("returns null (follow the device) for missing or unknown values", () => {
    expect(parseColorScheme(undefined)).toBeNull();
    expect(parseColorScheme("")).toBeNull();
    expect(parseColorScheme("system")).toBeNull();
  });
});

describe("server rendering", () => {
  it("adds the dark class only for an explicit dark choice", () => {
    expect(serverDarkClass(ColorScheme.DARK)).toBe("dark");
    expect(serverDarkClass(ColorScheme.LIGHT)).toBe("");
    expect(serverDarkClass(null)).toBe("");
  });

  it("emits a pre-paint device check only when no choice was made", () => {
    expect(systemColorSchemeScript(ColorScheme.LIGHT)).toBeNull();
    expect(systemColorSchemeScript(ColorScheme.DARK)).toBeNull();
    expect(systemColorSchemeScript(null)).toContain("prefers-color-scheme: dark");
  });
});
