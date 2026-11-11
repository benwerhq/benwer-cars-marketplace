import type { InsurancePackageQuote } from "@/types/insurance";
import { getOpenApiClient } from "./client";
import { mapInsurancePackageList } from "./mappers";

export const insuranceApi = {
  list(
    companySlug: string,
    params: { vehicleId: string; startDate: string; endDate: string },
  ): Promise<InsurancePackageQuote[]> {
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
