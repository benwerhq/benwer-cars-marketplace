import { joinApiUrl } from "@/lib/publicApiProxy";
import { ApiError } from "@/lib/errors";
import { isLiveApiConfigured, liveApiBaseUrl, throwApiError } from "./client";

export const MARKETPLACE_CONTACT_SOURCE = "marketplace" as const;

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function buildMarketplaceContactBody(payload: ContactPayload) {
  return {
    name: payload.name,
    email: payload.email,
    subject: `[Marketplace] ${payload.subject}`,
    message: payload.message,
    source: MARKETPLACE_CONTACT_SOURCE,
  };
}

function contactUrl(): string {
  const origin = liveApiBaseUrl();
  return origin ? joinApiUrl(origin, "/v1/contact") : "";
}

export const contactApi = {
  async send(payload: ContactPayload): Promise<void> {
    if (!isLiveApiConfigured()) {
      throw new ApiError(0, "network");
    }

    const response = await fetch(contactUrl(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildMarketplaceContactBody(payload)),
    });

    if (!response.ok) {
      throwApiError(
        response.status,
        await response.json().catch(() => ({})),
      );
    }
  },
};
