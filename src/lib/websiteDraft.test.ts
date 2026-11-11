import { describe, expect, it } from "vitest";
import { BookingMode, SiteLayout, SiteStatus } from "@/enums";
import { applyWebsiteDraft, settingsFromSite } from "./websiteDraft";
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
  },
  branches: [],
};

describe("websiteDraft", () => {
  it("applies a layout preview onto the public site", () => {
    const draft = {
      ...settingsFromSite(site),
      layout: SiteLayout.BOLD_LANDING,
      primaryColor: "#ff0000",
    };
    const next = applyWebsiteDraft(site, draft);
    expect(next.layout).toBe(SiteLayout.BOLD_LANDING);
    expect(next.company.branding.primaryColor).toBe("#ff0000");
  });
});
