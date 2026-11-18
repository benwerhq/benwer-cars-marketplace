import { ApiError } from "@/lib/errors";
import { getStaffAccessToken } from "@/lib/staffAccessToken";
import type {
  WebsiteImageUpload,
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

async function uploadCompanyLogoKind(
  companyId: string,
  file: File,
  kind: "company_logo" | "company_logo_light",
): Promise<string> {
  const headers = await staffHeaders();
  const body = new FormData();
  body.append("file", file);
  const data = await publicRequest<{ url?: unknown }>("/v1/uploads", {
    method: "POST",
    headers,
    body,
    query: { kind, entityId: companyId },
  });
  if (typeof data.url !== "string" || !data.url) {
    throw new ApiError(502, "uploads.missing_url");
  }
  return data.url;
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

  async uploadCompanyLogo(companyId: string, file: File): Promise<string> {
    const url = await uploadCompanyLogoKind(companyId, file, "company_logo");
    await uploadCompanyLogoKind(companyId, file, "company_logo_light");
    return url;
  },

  async uploadImage(companyId: string, file: File): Promise<WebsiteImageUpload> {
    const headers = await staffHeaders();
    const body = new FormData();
    body.append("file", file);
    const data = await publicRequest<{ id?: unknown; url?: unknown }>("/v1/uploads", {
      method: "POST",
      headers,
      body,
      query: { kind: "website_hero", entityId: companyId },
    });
    if (typeof data.id !== "string" || !data.id) {
      throw new ApiError(502, "uploads.missing_id");
    }
    return { id: data.id, url: typeof data.url === "string" ? data.url : null };
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
