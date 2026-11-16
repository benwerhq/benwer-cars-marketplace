"use client";

import { useQuery } from "@tanstack/react-query";
import { sitesApi } from "@/services/api";
import { siteQueryKey } from "@/lib/queryKeys";

export function useSite(slug: string, preview?: string) {
  return useQuery({
    queryKey: siteQueryKey(slug, preview),
    queryFn: () => sitesApi.getBySlug(slug, { preview }),
    enabled: Boolean(slug),
  });
}
