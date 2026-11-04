import type { PriceBreakdown, PriceQuoteQuery } from "@/types/pricing";
import { getOpenApiClient } from "./client";
import { mapPriceBreakdown } from "./mappers";

export const pricingApi = {
  quote(
    companySlug: string,
    params: PriceQuoteQuery,
  ): Promise<PriceBreakdown | null> {
    return getOpenApiClient()
      .GET("/v1/public/companies/{slug}/price-quote", {
        params: {
          path: { slug: companySlug },
          query: {
            vehicleId: params.vehicleId,
            startDate: params.startDate,
            endDate: params.endDate,
          },
        },
      })
      .then(({ data }) => mapPriceBreakdown(data));
  },
};
