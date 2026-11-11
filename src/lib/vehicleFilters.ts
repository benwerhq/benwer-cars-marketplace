import { SearchParams, TransmissionType, VehicleType } from "@/enums";
import type { VehicleFilters } from "@/types/vehicle";

export const FILTER_VEHICLE_TYPES = [
  VehicleType.CAR,
  VehicleType.SUV,
  VehicleType.VAN,
] as const;

const PUBLIC_VEHICLE_TYPE_QUERY = [
  "economy",
  "sedan",
  "suv",
  "minivan",
  "van",
  "other",
] as const;

export type PublicVehicleTypeQuery = (typeof PUBLIC_VEHICLE_TYPE_QUERY)[number];

const PUBLIC_VEHICLE_TYPE_QUERY_SET = new Set<string>(
  PUBLIC_VEHICLE_TYPE_QUERY,
);

export function toPublicVehicleTypeQuery(
  type: string | undefined,
): PublicVehicleTypeQuery | undefined {
  if (!type || type === VehicleType.CAR) {
    return undefined;
  }

  if (type === VehicleType.SUV) {
    return "suv";
  }

  if (type === VehicleType.VAN) {
    return "van";
  }

  if (PUBLIC_VEHICLE_TYPE_QUERY_SET.has(type)) {
    return type as PublicVehicleTypeQuery;
  }

  return undefined;
}

export const FILTER_SEAT_OPTIONS = [4, 5, 7] as const;

const VEHICLE_TYPE_VALUES = new Set<string>(Object.values(VehicleType));
const TRANSMISSION_VALUES = new Set<string>(Object.values(TransmissionType));
const SEAT_VALUES = new Set<number>(FILTER_SEAT_OPTIONS);

function setOrDelete(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
) {
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
}

function parseVehicleType(value: string | null): VehicleType | undefined {
  if (!value || !VEHICLE_TYPE_VALUES.has(value)) {
    return undefined;
  }

  return value as VehicleType;
}

function parseTransmission(value: string | null): TransmissionType | undefined {
  if (!value || !TRANSMISSION_VALUES.has(value)) {
    return undefined;
  }

  return value as TransmissionType;
}

function parseSeats(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const seats = Number.parseInt(value, 10);
  if (!Number.isInteger(seats) || !SEAT_VALUES.has(seats)) {
    return undefined;
  }

  return seats;
}

export function serializeCompanySlugs(slugs: string[]): string {
  return [...new Set(slugs.filter(Boolean))].sort().join(",");
}

export function parseCompanySlugsParam(
  value: string | null,
): string[] | undefined {
  if (!value) {
    return undefined;
  }

  const slugs = value
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);

  return slugs.length ? slugs : undefined;
}

export function parseCompanySlugs(
  searchParams: Pick<URLSearchParams, "get">,
): string[] | undefined {
  const fromList = parseCompanySlugsParam(
    searchParams.get(SearchParams.COMPANIES),
  );
  if (fromList) {
    return fromList;
  }

  const legacy = searchParams.get(SearchParams.COMPANY_SLUG);
  return legacy ? [legacy] : undefined;
}

function applyCompanySlugs(
  params: URLSearchParams,
  slugs: string[] | undefined,
) {
  params.delete(SearchParams.COMPANIES);
  params.delete(SearchParams.COMPANY_SLUG);

  if (slugs?.length) {
    params.set(SearchParams.COMPANIES, serializeCompanySlugs(slugs));
  }
}

export function parseVehicleFilters(
  searchParams: Pick<URLSearchParams, "get">,
): VehicleFilters {
  const from = searchParams.get(SearchParams.FROM) || undefined;
  const to = searchParams.get(SearchParams.TO) || undefined;
  const q = searchParams.get(SearchParams.Q) || undefined;
  const companySlugs = parseCompanySlugs(searchParams);

  return {
    type: parseVehicleType(searchParams.get(SearchParams.TYPE)),
    seats: parseSeats(searchParams.get(SearchParams.SEATS)),
    transmission: parseTransmission(
      searchParams.get(SearchParams.TRANSMISSION),
    ),
    from,
    to,
    q,
    companySlugs,
    companySlug: companySlugs?.[0],
    branchId: searchParams.get(SearchParams.BRANCH) || undefined,
  };
}

export function applyVehicleFilters(
  searchParams: Pick<URLSearchParams, "toString">,
  filters: VehicleFilters,
): URLSearchParams {
  const next = new URLSearchParams(searchParams.toString());

  setOrDelete(next, SearchParams.FROM, filters.from);
  setOrDelete(next, SearchParams.TO, filters.to);
  setOrDelete(next, SearchParams.TYPE, filters.type);
  setOrDelete(next, SearchParams.SEATS, filters.seats?.toString());
  setOrDelete(next, SearchParams.TRANSMISSION, filters.transmission);
  setOrDelete(next, SearchParams.Q, filters.q);
  setOrDelete(next, SearchParams.BRANCH, filters.branchId);
  applyCompanySlugs(
    next,
    filters.companySlugs ??
      (filters.companySlug ? [filters.companySlug] : undefined),
  );

  return next;
}

export function hasActiveVehicleFilters(filters: VehicleFilters): boolean {
  return Boolean(
    filters.type ||
    filters.seats ||
    filters.transmission ||
    filters.from ||
    filters.to ||
    filters.q ||
    filters.companySlug ||
    filters.companySlugs?.length,
  );
}

export function hasActiveAdvancedFilters(filters: VehicleFilters): boolean {
  return Boolean(
    filters.type ||
    filters.seats ||
    filters.transmission ||
    filters.q ||
    filters.companySlugs?.length,
  );
}

export function countAdvancedFilters(filters: VehicleFilters): number {
  let count = 0;

  if (filters.type) {
    count += 1;
  }
  if (filters.seats) {
    count += 1;
  }
  if (filters.transmission) {
    count += 1;
  }
  if (filters.q) {
    count += 1;
  }
  if (filters.companySlugs?.length) {
    count += filters.companySlugs.length;
  }

  return count;
}

export function parseBrowseParams(searchParams: Pick<URLSearchParams, "get">): {
  location?: string;
  from?: string;
  to?: string;
} {
  return {
    location: searchParams.get(SearchParams.LOCATION) || undefined,
    from: searchParams.get(SearchParams.FROM) || undefined,
    to: searchParams.get(SearchParams.TO) || undefined,
  };
}
