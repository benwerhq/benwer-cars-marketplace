"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { pricingApi } from "@/services/api";
import { priceQuoteQueryKey } from "@/lib/queryKeys";
import type { PriceQuoteQuery } from "@/types/pricing";

const QUOTE_STALE_MS = 60_000;

export function usePriceQuote(companySlug: string, params: PriceQuoteQuery) {
  return useQuery({
    queryKey: priceQuoteQueryKey(companySlug, params),
    queryFn: () => pricingApi.quote(companySlug, params),
    enabled:
      Boolean(companySlug) &&
      Boolean(params.vehicleId) &&
      Boolean(params.startDate) &&
      Boolean(params.endDate),
    placeholderData: keepPreviousData,
    staleTime: QUOTE_STALE_MS,
    retry: false,
  });
}
