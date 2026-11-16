import { describe, expect, it } from "vitest";
import { SiteEditSection, SiteEditTab } from "@/enums";
import {
  DEFAULT_ADMIN_ORIGIN,
  adminWebsiteHref,
  isSiteEditMode,
  parseEditFlag,
  tabForSection,
} from "./siteEdit";

describe("isSiteEditMode", () => {
  const preview = "preview-token-16c";

  it("requires a valid preview token, isPreview, and edit=1", () => {
    expect(
      isSiteEditMode({ isPreview: true, preview, edit: true }),
    ).toBe(true);
    expect(
      isSiteEditMode({ isPreview: false, preview, edit: true }),
    ).toBe(false);
    expect(
      isSiteEditMode({ isPreview: true, preview: "short", edit: true }),
    ).toBe(false);
    expect(
      isSiteEditMode({ isPreview: true, preview, edit: false }),
    ).toBe(false);
    expect(isSiteEditMode({ isPreview: true, edit: true })).toBe(false);
  });
});

describe("parseEditFlag", () => {
  it("treats only edit=1 as on", () => {
    expect(parseEditFlag("1")).toBe(true);
    expect(parseEditFlag("true")).toBe(false);
    expect(parseEditFlag("0")).toBe(false);
  });
});

describe("adminWebsiteHref", () => {
  it("points look sections at the admin Website look tab", () => {
    expect(adminWebsiteHref(SiteEditTab.LOOK, SiteEditSection.HERO)).toBe(
      `${DEFAULT_ADMIN_ORIGIN}/website?tab=look&section=hero`,
    );
  });

  it("points booking rules and domain at their admin tabs", () => {
    expect(tabForSection(SiteEditSection.RULES)).toBe(SiteEditTab.RULES);
    expect(tabForSection(SiteEditSection.DOMAIN)).toBe(SiteEditTab.DOMAIN);
    expect(adminWebsiteHref(SiteEditTab.RULES, SiteEditSection.RULES)).toBe(
      `${DEFAULT_ADMIN_ORIGIN}/website?tab=rules&section=rules`,
    );
    expect(adminWebsiteHref(SiteEditTab.DOMAIN, SiteEditSection.DOMAIN)).toBe(
      `${DEFAULT_ADMIN_ORIGIN}/website?tab=domain&section=domain`,
    );
  });
});
