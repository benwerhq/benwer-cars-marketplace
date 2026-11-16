"use client";

import { useQuery } from "@tanstack/react-query";
import { availabilityApi } from "@/services/api";
import { QueryKeys, type PublicChannel } from "@/enums";

export function useFleetAvailability(
  companySlug: string,
  params: {
    from: string;
    to: string;
    vehicleIds: string[];
    channel?: PublicChannel;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: [
      QueryKeys.AVAILABILITY,
      companySlug,
      "fleet",
      params.from,
      params.to,
      params.channel ?? null,
      params.vehicleIds,
    ],
    queryFn: () =>
      availabilityApi.checkMany(companySlug, {
        from: params.from,
        to: params.to,
        vehicleIds: params.vehicleIds,
        channel: params.channel,
      }),
    enabled:
      enabled &&
      Boolean(companySlug) &&
      Boolean(params.from) &&
      Boolean(params.to) &&
      params.vehicleIds.length > 0,
  });
}
