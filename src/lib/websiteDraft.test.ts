import { describe, expect, it } from "vitest";
import { BookingMode, SiteLayout, SiteStatus } from "@/enums";
import {
  applyWebsiteDraft,
  settingsFromSite,
  siteBrandColor,
  toWebsitePatch,
  websiteDraftDirty,
} from "./websiteDraft";
import type { PublicSite } from "@/types/site";
import { defaultSiteContent } from "./siteContent";

const site: PublicSite = {
  slug: "denver-cars",
  status: SiteStatus.PUBLISHED,
  bookingMode: BookingMode.INSTANT,
  minLeadHours: 24,
  requestWindowHours: 48,
  headline: { "en-GB": "Hello" },
  intro: { "en-GB": "Intro" },
  showPhone: true,
  showEmail: false,
  showAddress: false,
  isPreview: false,
  canonicalUrl: null,
  layout: SiteLayout.CLASSIC,
  content: defaultSiteContent(),
  allowDifferentReturn: false,
  oneWayRentals: false,
  company: {
    id: "c1",
    slug: "denver-cars",
    name: "Denver Cars",
    description: null,
    location: null,
    locationSlug: null,
    latitude: null,
    longitude: null,
    vehicleCount: 3,
    isPublic: true,
    websiteUrl: null,
    email: null,
    phone: null,
    address: null,
    branding: { primaryColor: "#111111", logoUrl: null },
    branches: [],
    allowDifferentReturn: false,
  },
  branches: [],
};

describe("websiteDraft", () => {
  it("previews the draft brand colour and content but keeps the site's live reviews", () => {
    const draft = settingsFromSite(site);
    draft.content = {
      ...draft.content,
      brandColor: "#ff0000",
      reviews: { average: 1, count: 1, items: [] },
    };
    const next = applyWebsiteDraft(site, draft);
    expect(siteBrandColor(next)).toBe("#ff0000");
    expect(next.content.reviews).toBe(site.content.reviews);
  });

  it("marks the draft dirty only when something the API stores changes", () => {
    const saved = settingsFromSite(site);
    expect(websiteDraftDirty(saved, { ...saved, revision: 9 })).toBe(false);
    expect(websiteDraftDirty(saved, { ...saved, showEmail: !saved.showEmail })).toBe(true);
    const patch = toWebsitePatch(saved);
    expect(patch.layout).toBe("classic");
    expect(patch.appearance).toHaveProperty("bannerTheme");
  });
});
