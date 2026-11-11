"use client";

import { useQuery } from "@tanstack/react-query";
import { insuranceApi } from "@/services/api";
import { QueryKeys } from "@/enums";
import type { PriceQuoteQuery } from "@/types/pricing";

export function useInsurancePackages(
  companySlug: string,
  params: PriceQuoteQuery,
) {
  return useQuery({
    queryKey: [
      QueryKeys.INSURANCE,
      companySlug,
      params.vehicleId,
      params.startDate,
      params.endDate,
    ],
    queryFn: () =>
      insuranceApi.list(companySlug, {
        vehicleId: params.vehicleId,
        startDate: params.startDate,
        endDate: params.endDate,
      }),
    enabled:
      Boolean(companySlug) &&
      Boolean(params.vehicleId) &&
      Boolean(params.startDate) &&
      Boolean(params.endDate),
    retry: false,
  });
}
