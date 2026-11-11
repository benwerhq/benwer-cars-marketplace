import type {
  AvailabilityQuery,
  AvailabilityRange,
} from "@/types/availability";
import { getOpenApiClient, publicRequest } from "./client";
import { mapAvailabilityList } from "./mappers";

async function fetchLiveAvailability(
  companySlug: string,
  params: AvailabilityQuery,
): Promise<AvailabilityRange[]> {
  if (!params.vehicleId) {
    const data = await publicRequest<unknown>(
      `/v1/public/companies/${encodeURIComponent(companySlug)}/availability`,
      { query: { from: params.from, to: params.to } },
    );
    return mapAvailabilityList(data, params);
  }

  const { data } = await getOpenApiClient().GET(
    "/v1/public/companies/{slug}/availability",
    {
      params: {
        path: { slug: companySlug },
        query: {
          from: params.from,
          to: params.to,
          vehicleId: params.vehicleId,
        },
      },
    },
  );

  return mapAvailabilityList(data, params);
}

export const availabilityApi = {
  check(
    companySlug: string,
    params: AvailabilityQuery,
  ): Promise<AvailabilityRange[]> {
    return fetchLiveAvailability(companySlug, params);
  },
};
