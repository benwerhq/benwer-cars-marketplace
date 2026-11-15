import { ApiError } from "@/lib/errors";
import { getGuestAccessToken } from "@/lib/guestAccessToken";
import type {
  GuestNotificationList,
  GuestNotificationUnreadCount,
  GuestVapidKey,
  GuestWebPushRegistrationInput,
} from "@/types/guestNotifications";
import { publicRequest } from "./client";

async function guestAuthHeaders(
  extra?: Record<string, string>,
): Promise<Record<string, string>> {
  const token = await getGuestAccessToken();
  if (!token) {
    throw new ApiError(401, "guest.unauthenticated");
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

export const guestNotificationsApi = {
  async list(cursor?: string, locale?: string): Promise<GuestNotificationList> {
    const params = new URLSearchParams({ limit: "20" });
    if (cursor) params.set("cursor", cursor);
    if (locale) params.set("locale", locale);
    const headers = await guestAuthHeaders(
      locale ? { "Accept-Language": locale } : undefined,
    );
    return publicRequest<GuestNotificationList>(
      `/v1/public/guest/notifications?${params.toString()}`,
      { headers },
    );
  },

  async unreadCount(): Promise<GuestNotificationUnreadCount> {
    const headers = await guestAuthHeaders();
    return publicRequest<GuestNotificationUnreadCount>(
      "/v1/public/guest/notifications/unread-count",
      { headers },
    );
  },

  async markRead(id: string): Promise<void> {
    const headers = await guestAuthHeaders();
    await publicRequest<void>(
      `/v1/public/guest/notifications/${encodeURIComponent(id)}/read`,
      { method: "POST", headers },
    );
  },

  async markAllRead(): Promise<void> {
    const headers = await guestAuthHeaders();
    await publicRequest<void>("/v1/public/guest/notifications/read-all", {
      method: "POST",
      headers,
    });
  },

  async dismiss(id: string): Promise<void> {
    const headers = await guestAuthHeaders();
    await publicRequest<void>(
      `/v1/public/guest/notifications/${encodeURIComponent(id)}/dismiss`,
      { method: "POST", headers },
    );
  },

  async vapidPublicKey(): Promise<GuestVapidKey> {
    const headers = await guestAuthHeaders();
    return publicRequest<GuestVapidKey>(
      "/v1/public/guest/devices/web-push/vapid-public-key",
      { headers },
    );
  },

  async registerWebPush(input: GuestWebPushRegistrationInput): Promise<void> {
    const headers = await guestAuthHeaders({
      "Content-Type": "application/json",
    });
    await publicRequest<void>("/v1/public/guest/devices/web-push", {
      method: "PUT",
      headers,
      body: JSON.stringify(input),
    });
  },

  async removeWebPush(endpoint: string): Promise<void> {
    const headers = await guestAuthHeaders({
      "Content-Type": "application/json",
    });
    await publicRequest<void>("/v1/public/guest/devices/web-push", {
      method: "DELETE",
      headers,
      body: JSON.stringify({ endpoint }),
    });
  },
};
