"use client";

import { useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "@/services/api";
import { vehiclesQueryKey } from "@/lib/queryKeys";
import { fleetFetchFilters, refineVehicles } from "@/lib/vehicleFilters";
import type { VehicleFilters } from "@/types/vehicle";

export function useVehicles(companySlug: string, filters?: VehicleFilters) {
  const fetchFilters = fleetFetchFilters(filters);
  const query = useQuery({
    queryKey: vehiclesQueryKey(companySlug, fetchFilters),
    queryFn: () => vehiclesApi.getByCompany(companySlug, fetchFilters),
    enabled: Boolean(companySlug),
  });

  return {
    ...query,
    allVehicles: query.data,
    data:
      query.data && filters ? refineVehicles(query.data, filters) : query.data,
  };
}
