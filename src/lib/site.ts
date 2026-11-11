import { BookingMode, PublicChannel, SearchParams, SiteStatus } from "@/enums";
import { appendSearchParams } from "@/lib/marketplaceSearch";
import type { PublicSite } from "@/types/site";

export const SITE_CHANNEL = PublicChannel.WEBSITE;

export function siteHomePath(slug: string): string {
  return `/s/${encodeURIComponent(slug)}`;
}

export function siteSearchPath(slug: string): string {
  return `${siteHomePath(slug)}/search`;
}

export function siteCarPath(slug: string, carId: string): string {
  return `${siteHomePath(slug)}/cars/${encodeURIComponent(carId)}`;
}

export function siteBookPath(slug: string): string {
  return `${siteHomePath(slug)}/book`;
}

export function siteBookingPath(slug: string, token: string): string {
  return `${siteHomePath(slug)}/booking/${encodeURIComponent(token)}`;
}

export function siteOwnerPath(slug: string): string {
  return `${siteHomePath(slug)}/owner`;
}

export function ownerHrefFromHome(homeHref: string): string {
  const url = new URL(homeHref, "https://benwer.local");
  return `${url.pathname.replace(/\/$/, "")}/owner${url.search}`;
}

export function siteGuestPath(slug: string): string {
  return `${siteHomePath(slug)}/guest`;
}

export function siteGuestBookingsPath(slug: string): string {
  return `${siteGuestPath(slug)}/bookings`;
}

export function siteGuestConfirmPath(slug: string): string {
  return `${siteGuestPath(slug)}/confirm`;
}

export function guestLinksFromHomeHref(homeHref: string): {
  signIn: string;
  bookings: string;
} {
  const url = new URL(homeHref, "https://benwer.local");
  const base = url.pathname.replace(/\/$/, "");
  return {
    signIn: `${base}/guest${url.search}`,
    bookings: `${base}/guest/bookings${url.search}`,
  };
}

export interface SiteLinkQuery {
  from?: string;
  to?: string;
  branch?: string;
  preview?: string;
  carId?: string;
  edit?: boolean;
}

export function withSiteQuery(path: string, query?: SiteLinkQuery): string {
  const href = appendSearchParams(path, {
    from: query?.from,
    to: query?.to,
  });
  const url = new URL(href, "https://benwer.local");
  if (query?.branch) {
    url.searchParams.set(SearchParams.BRANCH, query.branch);
  }
  if (query?.preview) {
    url.searchParams.set(SearchParams.PREVIEW, query.preview);
  }
  if (query?.carId) {
    url.searchParams.set(SearchParams.CAR_ID, query.carId);
  }
  if (query?.edit) {
    url.searchParams.set(SearchParams.EDIT, "1");
  }
  return `${url.pathname}${url.search}`;
}

export function siteBookHref(input: {
  slug: string;
  carId: string;
  from?: string;
  to?: string;
  branch?: string;
  preview?: string;
  edit?: boolean;
}): string {
  return withSiteQuery(siteBookPath(input.slug), {
    carId: input.carId,
    from: input.from,
    to: input.to,
    branch: input.branch,
    preview: input.preview,
    edit: input.edit,
  });
}

export function isSitePublished(site: PublicSite): boolean {
  return site.status === SiteStatus.PUBLISHED;
}

export function isSitePaused(site: PublicSite): boolean {
  return site.status === SiteStatus.PAUSED;
}

export function canAcceptBookings(site: PublicSite): boolean {
  return isSitePublished(site);
}

export function isRequestBooking(site: PublicSite): boolean {
  return site.bookingMode === BookingMode.REQUEST;
}

export function parsePreviewToken(
  searchParams: Pick<URLSearchParams, "get"> | { preview?: string | string[] },
): string | undefined {
  if ("get" in searchParams) {
    return searchParams.get(SearchParams.PREVIEW) || undefined;
  }

  const value = searchParams.preview;
  return Array.isArray(value) ? value[0] : value;
}

export function companySlugFromSite(site: PublicSite): string {
  return site.company.slug || site.slug;
}
