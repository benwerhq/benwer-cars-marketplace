import { ApiError } from "@/lib/errors";
import { getStaffAccessToken } from "@/lib/staffAccessToken";
import type {
  WebsiteSettings,
  WebsiteSettingsPatch,
} from "@/types/websiteSettings";
import { publicRequest } from "./client";
import { mapWebsiteSettings } from "./mappers";

async function staffHeaders(
  extra?: Record<string, string>,
): Promise<Record<string, string>> {
  const token = await getStaffAccessToken();
  if (!token) {
    throw new ApiError(401, "staff.unauthenticated");
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

export const websiteSettingsApi = {
  async get(): Promise<WebsiteSettings> {
    const headers = await staffHeaders();
    const data = await publicRequest<unknown>("/v1/settings/website", {
      headers,
    });
    return mapWebsiteSettings(data);
  },

  async publish(): Promise<WebsiteSettings> {
    const headers = await staffHeaders();
    const data = await publicRequest<unknown>("/v1/settings/website/publish", {
      method: "POST",
      headers,
    });
    return mapWebsiteSettings(data);
  },

  async pause(): Promise<WebsiteSettings> {
    const headers = await staffHeaders();
    const data = await publicRequest<unknown>("/v1/settings/website/pause", {
      method: "POST",
      headers,
    });
    return mapWebsiteSettings(data);
  },

  async save(patch: WebsiteSettingsPatch): Promise<WebsiteSettings> {
    const headers = await staffHeaders({
      "Content-Type": "application/json",
    });
    const data = await publicRequest<unknown>("/v1/settings/website", {
      method: "PATCH",
      headers,
      body: JSON.stringify(patch),
    });
    return mapWebsiteSettings(data);
  },
};
