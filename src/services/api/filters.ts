import { isProvinceWideLocation } from "@/data/malagaCities";
import { PublicChannel, VehicleStatus } from "@/enums";
import { matchesVehicleFilters, sortVehicles } from "@/lib/vehicleFilters";
import type { Company, CompanyListFilters } from "@/types/company";
import type { Vehicle, VehicleFilters } from "@/types/vehicle";

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export { matchesVehicleFilters, sortVehicles };

export function isListedVehicle(vehicle: Vehicle): boolean {
  return vehicle.isPublic && vehicle.status === VehicleStatus.AVAILABLE;
}

export function isPublicFleetVehicle(vehicle: Vehicle): boolean {
  return vehicle.isPublic;
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
