import { channelQuery } from "@/lib/publicChannel";
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
    return [];
  }

  const data = params.channel
    ? await publicRequest<unknown>(
        `/v1/public/companies/${encodeURIComponent(companySlug)}/availability`,
        {
          query: {
            vehicleId: params.vehicleId,
            from: params.from,
            to: params.to,
            ...channelQuery(params.channel),
          },
        },
      )
    : (
        await getOpenApiClient().GET(
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
        )
      ).data;

  return mapAvailabilityList(data, params);
}

export const availabilityApi = {
  check(
    companySlug: string,
    params: AvailabilityQuery,
  ): Promise<AvailabilityRange[]> {
    return fetchLiveAvailability(companySlug, params);
  },

  checkMany(
    companySlug: string,
    params: {
      from: string;
      to: string;
      vehicleIds: string[];
      channel?: AvailabilityQuery["channel"];
    },
  ): Promise<AvailabilityRange[]> {
    return Promise.all(
      params.vehicleIds.map((vehicleId) =>
        fetchLiveAvailability(companySlug, {
          from: params.from,
          to: params.to,
          vehicleId,
          channel: params.channel,
        }).catch(() => []),
      ),
    ).then((rows) => rows.flat());
  },
};
