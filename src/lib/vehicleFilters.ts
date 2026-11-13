import {
  FuelType,
  SearchParams,
  TransmissionType,
  VehicleCategory,
  VehicleSort,
  VehicleType,
} from "@/enums";
import type {
  MarketplaceSearchFilters,
  Vehicle,
  VehicleFilters,
  VehicleGroup,
} from "@/types/vehicle";

export const FILTER_CATEGORIES = Object.values(VehicleCategory);
export const FILTER_FUELS = Object.values(FuelType);
export const FILTER_TRANSMISSIONS = Object.values(TransmissionType);
export const FILTER_SORTS = Object.values(VehicleSort);

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

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

function parseList(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseEnumList<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T[] | undefined {
  const allowedSet = new Set<string>(allowed);
  const items = [
    ...new Set(parseList(value).filter((item) => allowedSet.has(item))),
  ] as T[];
  return items.length ? items : undefined;
}

function parseSeatList(value: string | null): number[] | undefined {
  const seats = [
    ...new Set(
      parseList(value)
        .map((item) => Number.parseInt(item, 10))
        .filter((item) => Number.isInteger(item) && item > 0),
    ),
  ].sort((a, b) => a - b);
  return seats.length ? seats : undefined;
}

function serializeList(values: readonly (string | number)[] | undefined) {
  return values?.length ? values.join(",") : undefined;
}

function parseCategories(
  searchParams: Pick<URLSearchParams, "get">,
): VehicleCategory[] | undefined {
  const categories = parseEnumList(
    searchParams.get(SearchParams.CATEGORY),
    FILTER_CATEGORIES,
  );
  if (categories) {
    return categories;
  }

  const legacyType = searchParams.get(SearchParams.TYPE);
  if (legacyType === VehicleType.SUV) {
    return [VehicleCategory.SUV];
  }
  if (legacyType === VehicleType.VAN) {
    return [VehicleCategory.VAN, VehicleCategory.MINIVAN];
  }
  return undefined;
}

function parseSort(value: string | null): VehicleSort | undefined {
  return FILTER_SORTS.find((sort) => sort === value);
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
  const companySlugs = parseCompanySlugs(searchParams);

  return {
    categories: parseCategories(searchParams),
    groups: parseList(searchParams.get(SearchParams.GROUP)).length
      ? [...new Set(parseList(searchParams.get(SearchParams.GROUP)))]
      : undefined,
    fuels: parseEnumList(searchParams.get(SearchParams.FUEL), FILTER_FUELS),
    transmissions: parseEnumList(
      searchParams.get(SearchParams.TRANSMISSION),
      FILTER_TRANSMISSIONS,
    ),
    seats: parseSeatList(searchParams.get(SearchParams.SEATS)),
    sort: parseSort(searchParams.get(SearchParams.SORT)),
    from: searchParams.get(SearchParams.FROM) || undefined,
    to: searchParams.get(SearchParams.TO) || undefined,
    q: searchParams.get(SearchParams.Q) || undefined,
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

  next.delete(SearchParams.TYPE);
  setOrDelete(next, SearchParams.FROM, filters.from);
  setOrDelete(next, SearchParams.TO, filters.to);
  setOrDelete(next, SearchParams.CATEGORY, serializeList(filters.categories));
  setOrDelete(next, SearchParams.GROUP, serializeList(filters.groups));
  setOrDelete(next, SearchParams.FUEL, serializeList(filters.fuels));
  setOrDelete(
    next,
    SearchParams.TRANSMISSION,
    serializeList(filters.transmissions),
  );
  setOrDelete(next, SearchParams.SEATS, serializeList(filters.seats));
  setOrDelete(next, SearchParams.SORT, filters.sort);
  setOrDelete(next, SearchParams.Q, filters.q?.trim() || undefined);
  setOrDelete(next, SearchParams.BRANCH, filters.branchId);
  applyCompanySlugs(
    next,
    filters.companySlugs ??
      (filters.companySlug ? [filters.companySlug] : undefined),
  );

  return next;
}

export function clearAdvancedFilters(filters: VehicleFilters): VehicleFilters {
  return {
    from: filters.from,
    to: filters.to,
    branchId: filters.branchId,
    sort: filters.sort,
  };
}

export function countAdvancedFilters(filters: VehicleFilters): number {
  return (
    (filters.categories?.length ?? 0) +
    (filters.groups?.length ?? 0) +
    (filters.fuels?.length ?? 0) +
    (filters.transmissions?.length ?? 0) +
    (filters.seats?.length ?? 0) +
    (filters.companySlugs?.length ?? 0) +
    (filters.q?.trim() ? 1 : 0)
  );
}

export function hasActiveAdvancedFilters(filters: VehicleFilters): boolean {
  return countAdvancedFilters(filters) > 0;
}

export function fleetFetchFilters(
  filters: VehicleFilters | undefined,
): VehicleFilters {
  return {
    from: filters?.from,
    to: filters?.to,
    branchId: filters?.branchId,
    channel: filters?.channel,
  };
}

const VEHICLE_CATEGORIES = new Set<string>(Object.values(VehicleCategory));

export function marketplaceFetchFilters(
  filters: MarketplaceSearchFilters | undefined,
): MarketplaceSearchFilters {
  return {
    location: filters?.location,
    from: filters?.from,
    to: filters?.to,
    branchId: filters?.branchId,
  };
}

export function vehicleCategoryOf(vehicle: Vehicle): VehicleCategory {
  if (vehicle.category && VEHICLE_CATEGORIES.has(vehicle.category)) {
    return vehicle.category as VehicleCategory;
  }

  if (vehicle.type === VehicleType.SUV) {
    return VehicleCategory.SUV;
  }

  if (vehicle.type === VehicleType.VAN) {
    return VehicleCategory.VAN;
  }

  return VehicleCategory.OTHER;
}

function excludedBy<T>(selected: T[] | undefined, value: T): boolean {
  return Boolean(selected?.length) && !selected?.includes(value);
}

export function matchesVehicleFilters(
  vehicle: Vehicle,
  filters?: VehicleFilters,
): boolean {
  if (!filters) {
    return true;
  }

  if (
    excludedBy(filters.categories, vehicleCategoryOf(vehicle)) ||
    excludedBy(filters.groups, vehicle.group?.id ?? "") ||
    excludedBy(filters.fuels, vehicle.fuel) ||
    excludedBy(filters.transmissions, vehicle.transmission) ||
    excludedBy(filters.seats, vehicle.seats) ||
    excludedBy(filters.companySlugs, vehicle.companySlug)
  ) {
    return false;
  }

  if (
    filters.branchId &&
    vehicle.branchId &&
    vehicle.branchId !== filters.branchId
  ) {
    return false;
  }

  if (filters.q) {
    const query = normalize(filters.q.trim());
    const haystack = normalize(
      `${vehicle.brand} ${vehicle.model} ${vehicle.description ?? ""}`,
    );
    if (!haystack.includes(query)) {
      return false;
    }
  }

  return true;
}

export function sortVehicles<T extends Vehicle>(
  vehicles: T[],
  sort?: VehicleSort,
): T[] {
  if (sort === VehicleSort.PRICE_DESC) {
    return [...vehicles].sort((a, b) => b.pricePerDay - a.pricePerDay);
  }

  if (sort === VehicleSort.PRICE_ASC) {
    return [...vehicles].sort((a, b) => a.pricePerDay - b.pricePerDay);
  }

  return vehicles;
}

export function refineVehicles<T extends Vehicle>(
  vehicles: T[],
  filters: VehicleFilters,
): T[] {
  return sortVehicles(
    vehicles.filter((vehicle) => matchesVehicleFilters(vehicle, filters)),
    filters.sort,
  );
}

function presentOptions<T extends string>(
  allowed: readonly T[],
  present: Iterable<T>,
  selected: readonly T[] | undefined,
): T[] {
  const keep = new Set<T>([...present, ...(selected ?? [])]);
  return allowed.filter((value) => keep.has(value));
}

export function categoryOptionsOf(
  vehicles: Vehicle[],
  selected?: VehicleCategory[],
): VehicleCategory[] {
  return presentOptions(
    FILTER_CATEGORIES,
    vehicles.map(vehicleCategoryOf),
    selected,
  );
}

export function groupOptionsOf(
  vehicles: Pick<Vehicle, "group">[],
  selected?: string[],
): VehicleGroup[] {
  const groups = new Map<string, VehicleGroup>();
  for (const vehicle of vehicles) {
    if (vehicle.group) {
      groups.set(vehicle.group.id, vehicle.group);
    }
  }
  const missing = (selected ?? []).filter((id) => !groups.has(id));
  return [
    ...[...groups.values()].sort((a, b) => a.sortOrder - b.sortOrder),
    ...missing.map((id) => ({ id, name: {}, code: null, sortOrder: 0 })),
  ];
}

export function fuelOptionsOf(
  vehicles: Pick<Vehicle, "fuel">[],
  selected?: FuelType[],
): FuelType[] {
  return presentOptions(
    FILTER_FUELS,
    vehicles.map((vehicle) => vehicle.fuel),
    selected,
  );
}

export function transmissionOptionsOf(
  vehicles: Pick<Vehicle, "transmission">[],
  selected?: TransmissionType[],
): TransmissionType[] {
  return presentOptions(
    FILTER_TRANSMISSIONS,
    vehicles.map((vehicle) => vehicle.transmission),
    selected,
  );
}

export function seatOptionsOf(vehicles: Pick<Vehicle, "seats">[]): number[] {
  const values = new Set<number>();
  for (const vehicle of vehicles) {
    if (vehicle.seats > 0) {
      values.add(vehicle.seats);
    }
  }
  return [...values].sort((a, b) => a - b);
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
