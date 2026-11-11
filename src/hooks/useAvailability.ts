"use client";

import { useQuery } from "@tanstack/react-query";
import { availabilityApi } from "@/services/api";
import { availabilityQueryKey } from "@/lib/availability";
import type { AvailabilityQuery } from "@/types/availability";

export function useAvailability(
  companySlug: string,
  params: AvailabilityQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: availabilityQueryKey(companySlug, params),
    queryFn: () => availabilityApi.check(companySlug, params),
    enabled:
      enabled &&
      Boolean(companySlug) &&
      Boolean(params.vehicleId) &&
      Boolean(params.from) &&
      Boolean(params.to),
  });
}
