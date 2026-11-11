import { isProvinceWideLocation } from "@/data/malagaCities";
import { PublicChannel, VehicleStatus } from "@/enums";
import type { Company, CompanyListFilters } from "@/types/company";
import type { Vehicle, VehicleFilters } from "@/types/vehicle";

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function isListedVehicle(vehicle: Vehicle): boolean {
  return vehicle.isPublic && vehicle.status === VehicleStatus.AVAILABLE;
}

export function isPublicFleetVehicle(vehicle: Vehicle): boolean {
  return vehicle.isPublic;
}

export function matchesVehicleFilters(
  vehicle: Vehicle,
  filters?: VehicleFilters,
): boolean {
  if (!filters) {
    return true;
  }

  if (filters.type && vehicle.type !== filters.type) {
    return false;
  }

  if (filters.transmission && vehicle.transmission !== filters.transmission) {
    return false;
  }

  if (filters.seats && vehicle.seats < filters.seats) {
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
    const query = normalize(filters.q);
    const haystack = normalize(
      `${vehicle.brand} ${vehicle.model} ${vehicle.description ?? ""}`,
    );
    if (!haystack.includes(query)) {
      return false;
    }
  }

  return true;
}

export function sortVehicles(vehicles: Vehicle[], sort?: string): Vehicle[] {
  if (sort === "pricePerDay:desc") {
    return [...vehicles].sort((a, b) => b.pricePerDay - a.pricePerDay);
  }

  if (sort === "pricePerDay:asc") {
    return [...vehicles].sort((a, b) => a.pricePerDay - b.pricePerDay);
  }

  return vehicles;
}

export function applyVehicleListFilters(
  vehicles: Vehicle[],
  filters?: VehicleFilters,
): Vehicle[] {
  const includeUnavailable = filters?.channel === PublicChannel.WEBSITE;
  return sortVehicles(
    vehicles.filter((vehicle) => {
      const listed = includeUnavailable
        ? isPublicFleetVehicle(vehicle)
        : isListedVehicle(vehicle);
      return listed && matchesVehicleFilters(vehicle, filters);
    }),
    filters?.sort,
  );
}

export function applyCompanyListFilters(
  companies: Company[],
  filters?: CompanyListFilters,
): Company[] {
  const cityFilter =
    filters?.location && !isProvinceWideLocation(filters.location)
      ? filters.location
      : undefined;
  const locationEnabled =
    Boolean(cityFilter) && companies.some((company) => company.locationSlug);

  return companies.filter((company) => {
    if (
      locationEnabled &&
      company.locationSlug &&
      company.locationSlug !== cityFilter
    ) {
      return false;
    }

    if (filters?.q) {
      const query = normalize(filters.q);
      const haystack = normalize(
        `${company.name} ${company.location ?? ""} ${company.description ?? ""}`,
      );
      if (!haystack.includes(query)) {
        return false;
      }
    }

    return true;
  });
}
