"use client";

import { useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "@/services/api";
import { QueryKeys, type PublicChannel } from "@/enums";

export function useVehicle(
  companySlug: string,
  vehicleId: string,
  channel?: PublicChannel,
) {
  return useQuery({
    queryKey: [QueryKeys.VEHICLE, companySlug, vehicleId, channel ?? null],
    queryFn: () => vehiclesApi.getById(companySlug, vehicleId, channel),
    enabled: Boolean(companySlug) && Boolean(vehicleId),
  });
}
