import { describe, expect, it } from "vitest";
import {
  SiteBannerPreset,
  SiteBannerTarget,
  SiteIncludedIcon,
  SitePaymentMethod,
  SiteSectionId,
} from "@/enums";
import {
  DEFAULT_BANNER_THEME,
  SITE_SECTION_ORDER,
  bannerImages,
  contrastWithWhite,
  defaultSiteContent,
  editableSections,
  isSafeUrl,
  moveSection,
  parseSiteContent,
  serializeAppearance,
  siteCompanyLogo,
  siteHeaderLogo,
  visibleSections,
  whatsappHref,
} from "./siteContent";

const facts = { branchCount: 2, hasPhone: true, hasEmail: false };

const legacyAppearance = {
  hero: { title: { "es-ES": "Hola" }, subtitle: {}, imageAssetId: null, imageUrl: null },
  template: "modern",
  theme: {
    primaryColor: "#1d4ed8",
    accentColor: "#1d4ed8",
    fontFamily: "serif",
    cornerRadius: "lg",
  },
  sections: [
    {
      id: "faq",
      enabled: true,
      order: 1,
      content: { items: [{ question: { "en-GB": "Q" }, answer: { "en-GB": "A" } }] },
    },
    { id: "hero", enabled: false, order: 0, content: { items: [] } },
    { id: "fleet", enabled: false, order: 2, content: { items: [] } },
  ],
};

describe("parseSiteContent", () => {
  it("falls back to every section, the three preset banners and default colours", () => {
    const content = defaultSiteContent();
    expect(content.sections.map((section) => section.id)).toEqual(SITE_SECTION_ORDER);
    expect(content.banners.map((banner) => banner.preset)).toEqual(
      Object.values(SiteBannerPreset),
    );
    expect(content.bannerTheme).toEqual(DEFAULT_BANNER_THEME);
    expect(
      content.sections.find((section) => section.id === SiteSectionId.INCLUDED)?.enabled,
    ).toBe(false);
  });

  it("reads API sections in order, keeps fleet on and reads FAQ items from the faq section", () => {
    const content = parseSiteContent(legacyAppearance, undefined);
    const ids = content.sections.map((section) => section.id);
    expect(ids.slice(0, 3)).toEqual([
      SiteSectionId.HERO,
      SiteSectionId.SEARCH,
      SiteSectionId.COMPANY,
    ]);
    expect(ids.indexOf(SiteSectionId.FAQ)).toBeLessThan(ids.indexOf(SiteSectionId.FLEET));
    expect(content.sections.find((section) => section.id === SiteSectionId.FLEET)?.enabled).toBe(true);
    expect(content.sections.find((section) => section.id === SiteSectionId.HERO)?.enabled).toBe(false);
    expect(content.faq).toHaveLength(1);
    expect(content.brandColor).toBe("#1d4ed8");
  });

  it("reads approved reviews from the API reviews payload", () => {
    const content = parseSiteContent(undefined, {
      average: 4.5,
      count: 2,
      items: [
        { rating: 5, text: "Great", createdAt: "2026-10-01T10:00:00Z" },
        { rating: 9, text: "Also great" },
        { rating: 3, text: "" },
      ],
    });
    expect(content.reviews.average).toBe(4.5);
    expect(content.reviews.items).toHaveLength(2);
    expect(content.reviews.items[1]?.rating).toBe(5);
  });

  it("drops unsafe banner links, bad colours and unknown payment methods", () => {
    const content = parseSiteContent(
      {
        banners: [
          { id: "a", preset: "airport", ctaTarget: "url", ctaUrl: "javascript:alert(1)" },
          { id: "b", preset: "nope", imageUrl: "https://cdn.example/b.png" },
        ],
        bannerTheme: { background: "#123456", text: "white" },
        contact: { whatsapp: "+34 600 12-34-56", payments: ["bizum", "paypal", "visa"] },
      },
      undefined,
    );
    expect(content.banners[0]?.ctaUrl).toBe("");
    expect(content.banners[1]?.preset).toBeNull();
    expect(content.bannerTheme.background).toBe("#123456");
    expect(content.bannerTheme.text).toBe(DEFAULT_BANNER_THEME.text);
    expect(content.contact.whatsapp).toBe("+34600123456");
    expect(content.contact.payments).toEqual([SitePaymentMethod.VISA, SitePaymentMethod.BIZUM]);
  });

  it("falls back to the preset icon for included items", () => {
    const [item] = parseSiteContent({ included: [{ preset: "fuel" }] }, undefined).included;
    expect(item?.icon).toBe(SiteIncludedIcon.FUEL);
  });
});

describe("serializeAppearance", () => {
  it("round-trips the API shape and strips view-only fields", () => {
    const content = parseSiteContent(legacyAppearance, undefined);
    content.banners = content.banners.map((banner, index) =>
      index === 0
        ? {
            ...banner,
            imageUrl: "https://cdn.example/x.png",
            ctaTarget: SiteBannerTarget.URL,
            ctaUrl: "https://x.example",
          }
        : banner,
    );
    content.contact.whatsapp = "600";
    const appearance = serializeAppearance(content);
    expect(appearance.template).toBe("classic");
    expect(appearance.theme).toEqual({
      primaryColor: "#1d4ed8",
      accentColor: "#1d4ed8",
      fontFamily: "serif",
      cornerRadius: "lg",
    });
    const sections = appearance.sections as {
      id: string;
      order: number;
      content: { items: unknown[] };
    }[];
    expect(sections).toHaveLength(SITE_SECTION_ORDER.length);
    expect(sections.map((section) => section.order)).toEqual(sections.map((_, index) => index));
    expect(sections.find((section) => section.id === "faq")?.content.items).toHaveLength(1);
    const banners = appearance.banners as Record<string, unknown>[];
    expect(banners[0]).not.toHaveProperty("imageUrl");
    expect(banners[0]?.ctaUrl).toBe("https://x.example");
    expect(banners[1]?.ctaUrl).toBeNull();
    expect((appearance.contact as { whatsapp: unknown }).whatsapp).toBeNull();
  });
});

describe("site logos, background and legal text", () => {
  it("keeps the new fields out of saves while the API does not know them", () => {
    const content = parseSiteContent(legacyAppearance, undefined);
    expect(content.supportsSiteBranding).toBe(false);
    expect(content.pageBackground).toBe("#ffffff");
    const saved = serializeAppearance(content);
    expect(saved).not.toHaveProperty("logos");
    expect(saved).not.toHaveProperty("pageBackground");
    expect(saved).not.toHaveProperty("legal");
  });

  it("round-trips logos, background and legal text once the API returns them", () => {
    const content = parseSiteContent(
      {
        ...legacyAppearance,
        logos: {
          headerAssetId: "asset-1",
          headerUrl: "https://cdn.example/header.png",
          companyAssetId: null,
          companyUrl: null,
        },
        pageBackground: "#f8fafc",
        legal: { privacy: { "en-GB": "We keep your data safe." }, terms: {} },
      },
      undefined,
    );
    expect(content.supportsSiteBranding).toBe(true);
    expect(serializeAppearance(content)).toMatchObject({
      logos: { headerAssetId: "asset-1", companyAssetId: null },
      pageBackground: "#f8fafc",
      legal: { privacy: { "en-GB": "We keep your data safe." }, terms: {} },
    });
    expect(serializeAppearance(content).logos).not.toHaveProperty("headerUrl");
  });

  it("defaults both logos to the company logo", () => {
    const content = parseSiteContent(
      { ...legacyAppearance, pageBackground: "#ffffff", logos: { headerUrl: "/h.png" } },
      undefined,
    );
    expect(siteHeaderLogo(content, "/company.png")).toBe("/h.png");
    expect(siteCompanyLogo(content, "/company.png")).toBe("/company.png");
  });
});

describe("visibleSections", () => {
  it("hides sections without content and keeps extras hidden", () => {
    const visible = visibleSections(defaultSiteContent(), facts);
    expect(visible).toContain(SiteSectionId.HERO);
    expect(visible).toContain(SiteSectionId.FLEET);
    expect(visible).toContain(SiteSectionId.BRANCHES);
    expect(visible).not.toContain(SiteSectionId.FAQ);
    expect(visible).not.toContain(SiteSectionId.EXTRAS);
    expect(visible).not.toContain(SiteSectionId.INCLUDED);
  });

  it("keeps enabled reviews and app sections so they can show their empty state", () => {
    const content = defaultSiteContent();
    const enabled = {
      ...content,
      sections: content.sections.map((section) =>
        section.id === SiteSectionId.REVIEWS || section.id === SiteSectionId.APP
          ? { ...section, enabled: true }
          : section,
      ),
    };
    const visible = visibleSections(enabled, facts);
    expect(visible).toContain(SiteSectionId.REVIEWS);
    expect(visible).toContain(SiteSectionId.APP);
  });
});

describe("helpers", () => {
  it("moves sections past hidden ones", () => {
    const sections = defaultSiteContent().sections;
    const moved = moveSection(sections, SiteSectionId.COMPANY, -1);
    expect(editableSections(moved)[0]?.id).toBe(SiteSectionId.COMPANY);
    expect(moveSection(moved, SiteSectionId.COMPANY, -1)).toBe(moved);
  });

  it("uses the uploaded image before the preset collage", () => {
    const [banner] = defaultSiteContent().banners;
    if (!banner) throw new Error("missing banner");
    expect(bannerImages(banner)).toEqual({
      mobile: "/images/banners/site-airport.webp",
      desktop: "/images/banners/site-airport-desktop.webp",
    });
    expect(bannerImages({ ...banner, imageUrl: "https://cdn.example/a.png" })).toEqual({
      mobile: "https://cdn.example/a.png",
      desktop: "https://cdn.example/a.png",
    });
  });

  it("builds WhatsApp links only for plausible numbers", () => {
    expect(whatsappHref("+34 600 12 34 56", "Hola")).toBe(
      "https://wa.me/34600123456?text=Hola",
    );
    expect(whatsappHref("123")).toBeNull();
  });

  it("matches the API contrast rule against white", () => {
    expect(contrastWithWhite("#0e7490")).toBeGreaterThanOrEqual(4.5);
    expect(contrastWithWhite("#e8a52c")).toBeLessThan(4.5);
  });

  it("accepts only http(s) and same-origin paths", () => {
    expect(isSafeUrl("https://x.example")).toBe(true);
    expect(isSafeUrl("/offers")).toBe(true);
    expect(isSafeUrl("//evil.example")).toBe(false);
    expect(isSafeUrl("data:text/html,hi")).toBe(false);
  });
});
