"use client";

import { useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "@/services/api";
import { marketplaceVehiclesQueryKey } from "@/lib/queryKeys";
import {
  marketplaceFetchFilters,
  refineVehicles,
} from "@/lib/vehicleFilters";
import type { MarketplaceSearchFilters } from "@/types/vehicle";

export function useMarketplaceVehicles(
  filters: MarketplaceSearchFilters | undefined,
  enabled = true,
) {
  const fetchFilters = marketplaceFetchFilters(filters);
  const query = useQuery({
    queryKey: marketplaceVehiclesQueryKey(fetchFilters),
    queryFn: () => vehiclesApi.searchMarketplace(fetchFilters),
    enabled,
  });

  return {
    ...query,
    allVehicles: query.data,
    data:
      query.data && filters ? refineVehicles(query.data, filters) : query.data,
  };
}
