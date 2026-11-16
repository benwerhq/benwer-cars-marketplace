"use client";

import { useQuery } from "@tanstack/react-query";
import { oneWayFeeQueryKey } from "@/lib/queryKeys";
import { pricingApi } from "@/services/api";
import type { PriceQuoteQuery } from "@/types/pricing";

export function useOneWayFee(
  companySlug: string,
  params: PriceQuoteQuery & { returnBranchId: string },
) {
  return useQuery({
    queryKey: oneWayFeeQueryKey(companySlug, params),
    queryFn: () => pricingApi.oneWayFee(companySlug, params),
    enabled:
      Boolean(companySlug) &&
      Boolean(params.vehicleId) &&
      Boolean(params.startDate) &&
      Boolean(params.endDate) &&
      Boolean(params.returnBranchId),
    staleTime: 60_000,
    retry: false,
  });
}
