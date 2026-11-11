"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useStaffAuth } from "@/context/StaffAuthProvider";
import { logError } from "@/lib/logger";
import { websiteSettingsQueryKey } from "@/lib/queryKeys";
import { websiteSettingsApi } from "@/services/api/websiteSettings";
import type { WebsiteSettingsPatch } from "@/types/websiteSettings";

export function useWebsiteSettings() {
  const { user, ready, configured } = useStaffAuth();

  return useQuery({
    queryKey: websiteSettingsQueryKey(),
    queryFn: () => websiteSettingsApi.get(),
    enabled: ready && configured && Boolean(user),
    retry: false,
  });
}

export function useSaveWebsiteSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: WebsiteSettingsPatch) => websiteSettingsApi.save(patch),
    onSuccess: (data) => {
      queryClient.setQueryData(websiteSettingsQueryKey(), data);
    },
    onError: (error) => {
      logError(error, { context: "website_settings_save" });
    },
  });
}
