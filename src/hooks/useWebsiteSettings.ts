"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useStaffAuth } from "@/context/StaffAuthProvider";
import { logError } from "@/lib/logger";
import { websiteSettingsQueryKey } from "@/lib/queryKeys";
import { websiteSettingsApi } from "@/services/api/websiteSettings";
import type { WebsiteSettings, WebsiteSettingsPatch } from "@/types/websiteSettings";

export function useWebsiteSettings() {
  const { user, ready, configured } = useStaffAuth();

  return useQuery({
    queryKey: websiteSettingsQueryKey(),
    queryFn: () => websiteSettingsApi.get(),
    enabled: ready && configured && Boolean(user),
    retry: false,
  });
}

function useSettingsMutation<T>(
  action: (input: T) => Promise<WebsiteSettings>,
  context: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: (data) => {
      queryClient.setQueryData(websiteSettingsQueryKey(), data);
    },
    onError: (error) => {
      logError(error, { context });
    },
  });
}

export function useSaveWebsiteSettings() {
  return useSettingsMutation(
    (patch: WebsiteSettingsPatch) => websiteSettingsApi.save(patch),
    "website_settings_save",
  );
}

export function usePublishWebsite() {
  return useSettingsMutation(() => websiteSettingsApi.publish(), "website_publish");
}

export function usePauseWebsite() {
  return useSettingsMutation(() => websiteSettingsApi.pause(), "website_pause");
}
