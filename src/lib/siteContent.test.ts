import { describe, expect, it } from "vitest";
import { SiteIncludedIcon, SiteIncludedPreset, SiteSectionId } from "@/enums";
import {
  SITE_SECTION_ORDER,
  appQrTarget,
  defaultSiteContent,
  isSafeUrl,
  moveSection,
  parseSiteContent,
  visibleSections,
  whatsappHref,
} from "./siteContent";

const facts = { branchCount: 2, hasPhone: true, hasEmail: false };

describe("parseSiteContent", () => {
  it("returns defaults when the API sends nothing", () => {
    const content = parseSiteContent(undefined);
    expect(content.sections.map((section) => section.id)).toEqual(
      SITE_SECTION_ORDER,
    );
    expect(content.included.map((item) => item.preset)).toEqual(
      Object.values(SiteIncludedPreset),
    );
    expect(content.banners).toEqual([]);
  });

  it("keeps the saved section order and appends sections the API does not know yet", () => {
    const content = parseSiteContent({
      sections: [
        { id: "faq", enabled: false },
        { id: "fleet", enabled: false },
        { id: "unknown", enabled: true },
        { id: "faq", enabled: true },
      ],
    });
    expect(content.sections[0]).toEqual({ id: SiteSectionId.FAQ, enabled: false });
    expect(content.sections[1]).toEqual({ id: SiteSectionId.FLEET, enabled: true });
    expect(content.sections).toHaveLength(SITE_SECTION_ORDER.length);
  });

  it("drops unsafe URLs and caps banners at three", () => {
    const content = parseSiteContent({
      banners: [
        { imageUrl: "javascript:alert(1)", linkUrl: "https://ok.example/offer" },
        { imageUrl: "https://cdn.example/b2.jpg" },
        { imageUrl: "/banners/b3.jpg" },
        { imageUrl: "https://cdn.example/b4.jpg" },
      ],
    });
    expect(content.banners).toHaveLength(3);
    expect(content.banners[0]?.imageUrl).toBe("");
    expect(content.banners[0]?.linkUrl).toBe("https://ok.example/offer");
    expect(content.banners[2]?.imageUrl).toBe("/banners/b3.jpg");
  });

  it("keeps an empty included list when the owner removed every item", () => {
    expect(parseSiteContent({ included: [] }).included).toEqual([]);
  });

  it("falls back to the preset icon and accepts plain-string copy", () => {
    const [item] = parseSiteContent({
      included: [{ preset: "fuel", title: "Full tank" }],
    }).included;
    expect(item?.icon).toBe(SiteIncludedIcon.FUEL);
    expect(item?.title).toEqual({ "en-GB": "Full tank" });
  });

  it("drops incomplete reviews and FAQ entries and bounds the rating", () => {
    const content = parseSiteContent({
      reviews: {
        score: 9,
        count: "1860",
        items: [
          { author: "Tom", text: "Great", rating: 12 },
          { author: "", text: "No author" },
        ],
      },
      faq: [
        { question: { "en-GB": "Deposit?" }, answer: { "en-GB": "€300" } },
        { question: { "en-GB": "No answer" } },
      ],
    });
    expect(content.reviews.score).toBeNull();
    expect(content.reviews.count).toBe(1860);
    expect(content.reviews.items).toHaveLength(1);
    expect(content.reviews.items[0]?.rating).toBe(5);
    expect(content.faq).toHaveLength(1);
  });

  it("keeps only digits and plus in the WhatsApp number", () => {
    expect(
      parseSiteContent({ contact: { whatsapp: "+34 600 12-34-56" } }).contact
        .whatsapp,
    ).toBe("+34600123456");
  });
});

describe("visibleSections", () => {
  it("hides enabled sections that have nothing to show", () => {
    const visible = visibleSections(defaultSiteContent(), facts);
    expect(visible).toContain(SiteSectionId.FLEET);
    expect(visible).toContain(SiteSectionId.LOCATIONS);
    expect(visible).toContain(SiteSectionId.CONTACT);
    expect(visible).not.toContain(SiteSectionId.REVIEWS);
    expect(visible).not.toContain(SiteSectionId.APP);
    expect(visible).not.toContain(SiteSectionId.FAQ);
  });

  it("keeps the included-in-price section off until the owner opts in", () => {
    expect(visibleSections(defaultSiteContent(), facts)).not.toContain(
      SiteSectionId.INCLUDED,
    );
  });

  it("hides sections the owner switched off", () => {
    const content = defaultSiteContent();
    content.sections = content.sections.map((section) =>
      section.id === SiteSectionId.LOCATIONS
        ? { ...section, enabled: false }
        : section,
    );
    expect(visibleSections(content, facts)).not.toContain(
      SiteSectionId.LOCATIONS,
    );
  });
});

describe("helpers", () => {
  it("moves a section within bounds", () => {
    const sections = defaultSiteContent().sections;
    const moved = moveSection(sections, SiteSectionId.COMPANY, -1);
    expect(moved[0]?.id).toBe(SiteSectionId.COMPANY);
    expect(moveSection(moved, SiteSectionId.COMPANY, -1)).toBe(moved);
  });

  it("builds WhatsApp links only for plausible numbers", () => {
    expect(whatsappHref("+34 600 12 34 56", "Hola")).toBe(
      "https://wa.me/34600123456?text=Hola",
    );
    expect(whatsappHref("123")).toBeNull();
  });

  it("prefers the Android store link for the QR code", () => {
    expect(
      appQrTarget({
        iosUrl: "https://apps.apple.com/app/1",
        androidUrl: "https://play.google.com/store/apps/details?id=x",
        title: {},
        text: {},
      }),
    ).toContain("play.google.com");
  });

  it("accepts only http(s) and same-origin paths", () => {
    expect(isSafeUrl("https://x.example")).toBe(true);
    expect(isSafeUrl("/offers")).toBe(true);
    expect(isSafeUrl("//evil.example")).toBe(false);
    expect(isSafeUrl("data:text/html,hi")).toBe(false);
  });
});
