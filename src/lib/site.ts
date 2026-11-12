import { BookingMode, DriverAgeBand, PublicChannel, SearchParams, SiteStatus } from "@/enums";
import { customDomainPublicPath } from "@/lib/customDomain";
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

export function isTenantHostRequest(headersList: Headers): boolean {
  return Boolean(headersList.get("x-company-slug"));
}

export function publicSitePath(
  sitePath: string,
  slug: string,
  onTenantHost: boolean,
): string {
  return onTenantHost ? customDomainPublicPath(sitePath, slug) : sitePath;
}

export function publicSiteHref(
  href: string,
  slug: string,
  onTenantHost: boolean,
): string {
  if (!onTenantHost) {
    return href;
  }

  const url = new URL(href, "https://benwer.local");
  url.pathname = customDomainPublicPath(url.pathname, slug);
  return `${url.pathname}${url.search}`;
}

export function publicSiteHomeHref(
  slug: string,
  onTenantHost: boolean,
  query?: SiteLinkQuery,
): string {
  return withSiteQuery(onTenantHost ? "/" : siteHomePath(slug), query);
}

export function sitePathFromHome(homeHref: string, suffix: string): string {
  const url = new URL(homeHref, "https://benwer.local");
  const base = url.pathname.replace(/\/$/, "");
  const path = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return `${base}${path}`;
}

export function publicHomeFromHome(homeHref: string): string {
  return new URL(homeHref, "https://benwer.local").pathname;
}

export function siteChildFromHome(homeHref: string, suffix: string): string {
  const url = new URL(homeHref, "https://benwer.local");
  return `${sitePathFromHome(homeHref, suffix)}${url.search}`;
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

export function siteGuestProfilePath(slug: string): string {
  return `${siteGuestPath(slug)}/profile`;
}

export function guestLinksFromHomeHref(homeHref: string): {
  signIn: string;
  bookings: string;
  profile: string;
} {
  const url = new URL(homeHref, "https://benwer.local");
  const base = url.pathname.replace(/\/$/, "");
  return {
    signIn: `${base}/guest${url.search}`,
    bookings: `${base}/guest/bookings${url.search}`,
    profile: `${base}/guest/profile${url.search}`,
  };
}

export interface SiteLinkQuery {
  from?: string;
  to?: string;
  branch?: string;
  returnBranch?: string;
  driverAge?: DriverAgeBand;
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
  if (query?.returnBranch && query.returnBranch !== query.branch) {
    url.searchParams.set(SearchParams.RETURN_BRANCH, query.returnBranch);
  }
  if (query?.driverAge && query.driverAge !== DriverAgeBand.STANDARD) {
    url.searchParams.set(SearchParams.DRIVER_AGE, query.driverAge);
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
  returnBranch?: string;
  preview?: string;
  edit?: boolean;
}): string {
  return withSiteQuery(siteBookPath(input.slug), {
    carId: input.carId,
    from: input.from,
    to: input.to,
    branch: input.branch,
    returnBranch: input.returnBranch,
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

export function parseDriverAge(value: string | null | undefined): DriverAgeBand {
  return (Object.values(DriverAgeBand) as string[]).includes(value ?? "")
    ? (value as DriverAgeBand)
    : DriverAgeBand.STANDARD;
}
