import { ApiError } from "@/lib/errors";
import { getGuestAccessToken } from "@/lib/guestAccessToken";
import { isGuestNotLinkedError } from "@/lib/guestAccount";
import type {
  GuestAccount,
  GuestLinkPayload,
  GuestLinkRequestResult,
} from "@/types/guest";
import type { GuestReservation } from "@/types/reservation";
import { publicRequest } from "./client";
import { mapGuestAccount, mapGuestReservationList, mapReservation } from "./mappers";

function guestPath(companySlug: string, suffix = ""): string {
  return `/v1/public/companies/${encodeURIComponent(companySlug)}/guest${suffix}`;
}

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

export const guestApi = {
  async me(companySlug: string): Promise<GuestAccount> {
    const headers = await guestAuthHeaders();
    const data = await publicRequest<unknown>(guestPath(companySlug, "/me"), {
      headers,
    });
    return mapGuestAccount(data, companySlug);
  },

  async listReservations(companySlug: string): Promise<GuestReservation[]> {
    const headers = await guestAuthHeaders();
    try {
      const data = await publicRequest<unknown>(
        guestPath(companySlug, "/reservations"),
        { headers },
      );
      return mapGuestReservationList(data, companySlug);
    } catch (error) {
      if (isGuestNotLinkedError(error)) {
        return [];
      }
      throw error;
    }
  },

  async getReservation(
    companySlug: string,
    id: string,
  ): Promise<GuestReservation> {
    const headers = await guestAuthHeaders();
    const data = await publicRequest<unknown>(
      guestPath(companySlug, `/reservations/${encodeURIComponent(id)}`),
      { headers },
    );
    return mapReservation(data, companySlug);
  },

  async requestLink(
    companySlug: string,
    payload: GuestLinkPayload,
  ): Promise<GuestLinkRequestResult> {
    const headers = await guestAuthHeaders({
      "Content-Type": "application/json",
    });
    const body: Record<string, string> = {};
    if (payload.email) {
      body.email = payload.email;
    }
    if (payload.bookingToken) {
      body.bookingToken = payload.bookingToken;
    }

    const data = await publicRequest<{ sent?: boolean }>(
      guestPath(companySlug, "/link"),
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      },
    );
    return { sent: data?.sent !== false };
  },

  async confirmLink(companySlug: string, token: string): Promise<void> {
    const headers = await guestAuthHeaders({
      "Content-Type": "application/json",
    });
    await publicRequest<unknown>(guestPath(companySlug, "/link/confirm"), {
      method: "POST",
      headers,
      body: JSON.stringify({ token }),
    });
  },

  /** Needs the API's PATCH guest/me (guest booking fields change). */
  async updateMe(
    companySlug: string,
    payload: { fullName?: string; phone?: string; dateOfBirth?: string | null },
  ): Promise<GuestAccount> {
    const headers = await guestAuthHeaders({ "Content-Type": "application/json" });
    const data = await publicRequest<unknown>(guestPath(companySlug, "/me"), {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });
    return mapGuestAccount(data, companySlug);
  },

  async unlink(companySlug: string): Promise<void> {
    const headers = await guestAuthHeaders();
    await publicRequest<unknown>(guestPath(companySlug, "/link"), {
      method: "DELETE",
      headers,
    });
  },

  async erase(companySlug: string): Promise<void> {
    const headers = await guestAuthHeaders();
    await publicRequest<unknown>(guestPath(companySlug), {
      method: "DELETE",
      headers,
    });
  },
};
