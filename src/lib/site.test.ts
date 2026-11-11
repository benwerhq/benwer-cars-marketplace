import { describe, expect, it } from "vitest";
import { BookingMode, SiteStatus } from "@/enums";
import { PublicChannel } from "@/enums";
import {
  SITE_CHANNEL,
  canAcceptBookings,
  companySlugFromSite,
  isRequestBooking,
  isSitePaused,
  siteBookHref,
  siteCarPath,
  siteHomePath,
  withSiteQuery,
} from "./site";
import type { PublicSite } from "@/types/site";

function site(overrides: Partial<PublicSite> = {}): PublicSite {
  return {
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
      branding: { primaryColor: "", logoUrl: null },
    },
    branches: [],
    ...overrides,
  };
}

describe("SITE_CHANNEL", () => {
  it("is website so unlisted companies can serve their own site", () => {
    expect(SITE_CHANNEL).toBe(PublicChannel.WEBSITE);
  });
});

describe("site paths", () => {
  it("builds tenant-isolated /s/{slug} routes", () => {
    expect(siteHomePath("denver-cars")).toBe("/s/denver-cars");
    expect(siteCarPath("denver-cars", "v1")).toBe("/s/denver-cars/cars/v1");
    expect(
      siteBookHref({
        slug: "denver-cars",
        carId: "v1",
        from: "2026-09-20",
        to: "2026-09-24",
        preview: "tok",
      }),
    ).toBe(
      "/s/denver-cars/book?from=2026-09-20&to=2026-09-24&preview=tok&carId=v1",
    );
  });

  it("preserves preview on site links", () => {
    expect(withSiteQuery("/s/denver-cars", { preview: "abc" })).toBe(
      "/s/denver-cars?preview=abc",
    );
  });

  it("keeps edit=1 on site links in draft edit mode", () => {
    expect(
      withSiteQuery("/s/denver-cars", { preview: "abc", edit: true }),
    ).toBe("/s/denver-cars?preview=abc&edit=1");
  });
});

describe("site booking rules", () => {
  it("allows bookings only when published", () => {
    expect(canAcceptBookings(site())).toBe(true);
    expect(canAcceptBookings(site({ status: SiteStatus.PAUSED }))).toBe(false);
    expect(canAcceptBookings(site({ status: SiteStatus.DRAFT }))).toBe(false);
    expect(isSitePaused(site({ status: SiteStatus.PAUSED }))).toBe(true);
  });

  it("detects request mode and company slug from the resolved site", () => {
    expect(isRequestBooking(site({ bookingMode: BookingMode.REQUEST }))).toBe(
      true,
    );
    expect(
      companySlugFromSite(
        site({
          slug: "site-slug",
          company: {
            ...site().company,
            slug: "company-from-api",
          },
        }),
      ),
    ).toBe("company-from-api");
  });
});
