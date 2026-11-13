import { NavRoutes, SearchParams } from "@/enums";
import { DEFAULT_CITY_SLUG } from "@/data/malagaCities";
import { buildCompanySiteHref } from "@/lib/companySite";
import { serializeCompanySlugs } from "@/lib/vehicleFilters";

export function appendSearchParams(
  path: string,
  input?: {
    location?: string;
    from?: string;
    to?: string;
    view?: string;
    companySlug?: string;
    companySlugs?: string[];
    preview?: string;
    branch?: string;
    return?: string;
    age?: string;
  },
): string {
  const params = new URLSearchParams();

  if (input?.location) {
    params.set(SearchParams.LOCATION, input.location);
  }

  if (input?.from) {
    params.set(SearchParams.FROM, input.from);
  }

  if (input?.to) {
    params.set(SearchParams.TO, input.to);
  }

  if (input?.view) {
    params.set(SearchParams.VIEW, input.view);
  }

  const companySlugs = input?.companySlugs?.length
    ? input.companySlugs
    : input?.companySlug
      ? [input.companySlug]
      : [];

  if (companySlugs.length) {
    params.set(SearchParams.COMPANIES, serializeCompanySlugs(companySlugs));
  }

  if (input?.preview) {
    params.set(SearchParams.PREVIEW, input.preview);
  }

  if (input?.branch) {
    params.set(SearchParams.BRANCH, input.branch);
  }

  if (input?.return) {
    params.set(SearchParams.RETURN_BRANCH, input.return);
  }

  if (input?.age) {
    params.set(SearchParams.DRIVER_AGE, input.age);
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function buildCarsSearchHref(input: {
  location?: string;
  from?: string;
  to?: string;
  companySlug?: string;
  companySlugs?: string[];
}): string {
  return appendSearchParams(NavRoutes.CARS, {
    location: input.location || DEFAULT_CITY_SLUG,
    from: input.from,
    to: input.to,
    companySlug: input.companySlug,
    companySlugs: input.companySlugs,
  });
}

export function buildCompaniesSearchHref(input: {
  location?: string;
  branch?: string;
  from?: string;
  to?: string;
  view?: string;
}): string {
  return appendSearchParams(NavRoutes.COMPANIES, {
    location: input.branch ? undefined : input.location || DEFAULT_CITY_SLUG,
    branch: input.branch,
    from: input.from,
    to: input.to,
    view: input.view,
  });
}

export function buildCompaniesMapHref(input?: {
  from?: string;
  to?: string;
}): string {
  return appendSearchParams(NavRoutes.COMPANIES, {
    from: input?.from,
    to: input?.to,
    view: "map",
  });
}

export function buildCompanyHref(
  slug: string,
  input?: {
    location?: string;
    from?: string;
    to?: string;
  },
): string {
  return buildCompanySiteHref({
    slug,
    from: input?.from,
    to: input?.to,
  });
}
