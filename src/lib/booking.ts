import { NavRoutes, SearchParams } from "@/enums";
import { buildCompanyCarHref, buildCompanySiteHref } from "@/lib/companySite";
import { appendSearchParams } from "@/lib/marketplaceSearch";

/**
 * Sets (or removes, when empty) query params on a relative or absolute href
 * without touching the rest of it. Relative hrefs stay relative.
 */
export function setHrefParams(
  href: string,
  params: Record<string, string | null | undefined>,
): string {
  const absolute = /^https?:\/\//i.test(href);
  const url = new URL(href, "https://benwer.local");
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  }
  return absolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
}

export function buildBookHref(input: {
  companySlug: string;
  carId: string;
  from?: string;
  to?: string;
}): string {
  const params = new URLSearchParams();
  params.set(SearchParams.COMPANY_SLUG, input.companySlug);
  params.set(SearchParams.CAR_ID, input.carId);
  if (input.from) {
    params.set(SearchParams.FROM, input.from);
  }
  if (input.to) {
    params.set(SearchParams.TO, input.to);
  }
  return `${NavRoutes.BOOK}?${params.toString()}`;
}

export function buildCarDetailHref(input: {
  companySlug: string;
  carId: string;
  from?: string;
  to?: string;
  isTenant?: boolean;
}): string {
  if (input.isTenant) {
    return appendSearchParams(`/cars/${encodeURIComponent(input.carId)}`, {
      from: input.from,
      to: input.to,
    });
  }

  return buildCompanyCarHref({
    slug: input.companySlug,
    vehicleId: input.carId,
    from: input.from,
    to: input.to,
  });
}

export function buildFleetHref(input: {
  companySlug: string;
  from?: string;
  to?: string;
  isTenant?: boolean;
}): string {
  if (input.isTenant) {
    return appendSearchParams(NavRoutes.HOME, {
      from: input.from,
      to: input.to,
    });
  }

  return buildCompanySiteHref({
    slug: input.companySlug,
    from: input.from,
    to: input.to,
  });
}
