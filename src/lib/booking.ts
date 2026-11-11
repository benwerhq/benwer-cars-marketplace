import { NavRoutes, SearchParams } from "@/enums";
import { buildCompanyCarHref, buildCompanySiteHref } from "@/lib/companySite";
import { appendSearchParams } from "@/lib/marketplaceSearch";

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
