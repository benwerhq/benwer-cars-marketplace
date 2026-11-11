import { channelQuery } from "@/lib/publicChannel";
import type { PriceBreakdown, PriceQuoteQuery } from "@/types/pricing";
import { getOpenApiClient, publicRequest } from "./client";
import { mapPriceBreakdown } from "./mappers";

export const pricingApi = {
  quote(
    companySlug: string,
    params: PriceQuoteQuery,
  ): Promise<PriceBreakdown | null> {
    if (params.channel) {
      return publicRequest<unknown>(
        `/v1/public/companies/${encodeURIComponent(companySlug)}/price-quote`,
        {
          query: {
            vehicleId: params.vehicleId,
            startDate: params.startDate,
            endDate: params.endDate,
            ...channelQuery(params.channel),
          },
        },
      ).then((data) => mapPriceBreakdown(data));
    }

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
