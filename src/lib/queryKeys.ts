import { QueryKeys } from "@/enums";
import type { CompanyListFilters } from "@/types/company";
import type { PriceQuoteQuery } from "@/types/pricing";
import type { MarketplaceSearchFilters, VehicleFilters } from "@/types/vehicle";

function compactQueryFilters<T extends object>(filters?: T): T | undefined {
  if (!filters) {
    return undefined;
  }

  const compact = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined),
  ) as T;

  return Object.keys(compact).length > 0 ? compact : undefined;
}

export function companyQueryKey(slug: string) {
  return [QueryKeys.COMPANY, slug] as const;
}

export function companiesQueryKey(filters?: CompanyListFilters) {
  const compact = compactQueryFilters(filters);
  if (!compact) {
    return [QueryKeys.COMPANIES] as const;
  }

  return [QueryKeys.COMPANIES, compact] as const;
}

export function vehiclesQueryKey(
  companySlug: string,
  filters?: VehicleFilters,
) {
  const compact = compactQueryFilters(filters);
  if (!compact) {
    return [QueryKeys.VEHICLES, companySlug] as const;
  }

  return [QueryKeys.VEHICLES, companySlug, compact] as const;
}

export function marketplaceVehiclesQueryKey(
  filters?: MarketplaceSearchFilters,
) {
  const compact = compactQueryFilters(filters);
  if (!compact) {
    return [QueryKeys.VEHICLES, "marketplace"] as const;
  }

  return [QueryKeys.VEHICLES, "marketplace", compact] as const;
}

export function priceQuoteQueryKey(
  companySlug: string,
  query: PriceQuoteQuery,
) {
  return [
    QueryKeys.PRICE_QUOTE,
    companySlug,
    query.vehicleId,
    query.startDate,
    query.endDate,
  ] as const;
}
