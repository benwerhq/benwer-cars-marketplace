import { channelQuery } from "@/lib/publicChannel";
import type { PriceBreakdown, PriceQuoteQuery } from "@/types/pricing";
import { getOpenApiClient, publicRequest } from "./client";
import { mapPriceBreakdown } from "./mappers";

function readOneWayFee(data: unknown): number {
  if (typeof data === "object" && data !== null && "oneWayFee" in data) {
    const fee = (data as { oneWayFee: unknown }).oneWayFee;
    return typeof fee === "number" && Number.isFinite(fee) ? fee : 0;
  }
  return 0;
}

export const pricingApi = {
  oneWayFee(
    companySlug: string,
    params: PriceQuoteQuery & { returnBranchId: string },
  ): Promise<number> {
    return publicRequest<unknown>(
      `/v1/public/companies/${encodeURIComponent(companySlug)}/quotes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: params.vehicleId,
          startDate: params.startDate,
          endDate: params.endDate,
          returnBranchId: params.returnBranchId,
          ...(params.channel ? { channel: params.channel } : {}),
        }),
      },
    ).then(readOneWayFee);
  },

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
