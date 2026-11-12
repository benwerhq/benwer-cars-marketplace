"use client";

import { useQuery } from "@tanstack/react-query";
import type { PublicChannel } from "@/enums";
import { extrasApi } from "@/services/api/extras";

export function useExtras(companySlug: string, channel?: PublicChannel, enabled = true) {
  return useQuery({
    queryKey: ["public-extras", companySlug, channel ?? null],
    queryFn: () => extrasApi.list(companySlug, channel),
    enabled: enabled && Boolean(companySlug),
    staleTime: 5 * 60_000,
    retry: false,
  });
}
