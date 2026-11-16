import { describe, expect, it } from "vitest";
import { SiteLayout } from "@/enums";
import { parseSiteLayout, SITE_LAYOUTS } from "./siteLayout";

describe("parseSiteLayout", () => {
  it("defaults unknown values to classic", () => {
    expect(parseSiteLayout(undefined)).toBe(SiteLayout.CLASSIC);
    expect(parseSiteLayout("nope")).toBe(SiteLayout.CLASSIC);
  });

  it("accepts the five template ids", () => {
    expect(SITE_LAYOUTS).toHaveLength(5);
    expect(parseSiteLayout("modern_hero")).toBe(SiteLayout.MODERN_HERO);
    expect(parseSiteLayout("minimal-list")).toBe(SiteLayout.MINIMAL_LIST);
    expect(parseSiteLayout("gridGallery")).toBe(SiteLayout.GRID_GALLERY);
    expect(parseSiteLayout("bold_landing")).toBe(SiteLayout.BOLD_LANDING);
  });
});
