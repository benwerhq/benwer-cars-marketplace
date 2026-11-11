import { channelQuery } from "@/lib/publicChannel";
import type { PublicChannel } from "@/enums";
import type { InsurancePackageQuote } from "@/types/insurance";
import { getOpenApiClient, publicRequest } from "./client";
import { mapInsurancePackageList } from "./mappers";

export const insuranceApi = {
  list(
    companySlug: string,
    params: {
      vehicleId: string;
      startDate: string;
      endDate: string;
      channel?: PublicChannel;
    },
  ): Promise<InsurancePackageQuote[]> {
    if (params.channel) {
      return publicRequest<unknown>(
        `/v1/public/companies/${encodeURIComponent(companySlug)}/insurance-packages`,
        {
          query: {
            vehicleId: params.vehicleId,
            startDate: params.startDate,
            endDate: params.endDate,
            ...channelQuery(params.channel),
          },
        },
      ).then((data) => mapInsurancePackageList(data));
    }

    return getOpenApiClient()
      .GET("/v1/public/companies/{slug}/insurance-packages", {
        params: {
          path: { slug: companySlug },
          query: {
            vehicleId: params.vehicleId,
            startDate: params.startDate,
            endDate: params.endDate,
          },
        },
      })
      .then(({ data }) => mapInsurancePackageList(data));
  },
};
