import type {
  CreateGuestReservationPayload,
  GuestReservation,
} from "@/types/reservation";
import { getGuestAccessToken } from "@/lib/guestAccessToken";
import { getOpenApiClient, publicRequest } from "./client";
import { mapReservation } from "./mappers";

function reservationBody(payload: CreateGuestReservationPayload) {
  return {
    guestName: payload.guestName,
    guestEmail: payload.guestEmail,
    guestPhone: payload.guestPhone,
    vehicleId: payload.vehicleId,
    startDate: payload.startDate,
    endDate: payload.endDate,
    ...(payload.insurancePackageId
      ? { insurancePackageId: payload.insurancePackageId }
      : {}),
    ...(payload.addonIds?.length ? { addonIds: payload.addonIds.slice(0, 20) } : {}),
    ...(payload.returnBranchId ? { returnBranchId: payload.returnBranchId } : {}),
    ...(payload.pickupTime ? { pickupTime: payload.pickupTime } : {}),
    ...(payload.returnTime ? { returnTime: payload.returnTime } : {}),
    ...(payload.flightNumber?.trim() ? { flightNumber: payload.flightNumber.trim() } : {}),
    ...(payload.notes?.trim() ? { notes: payload.notes.trim() } : {}),
    ...(payload.dateOfBirth ? { dateOfBirth: payload.dateOfBirth } : {}),
    ...(payload.channel ? { channel: payload.channel } : {}),
    ...(payload.acceptTerms !== undefined
      ? { acceptTerms: payload.acceptTerms }
      : {}),
  };
}

export const reservationsApi = {
  create(
    companySlug: string,
    payload: CreateGuestReservationPayload,
  ): Promise<GuestReservation> {
    const body = reservationBody(payload);

    if (payload.channel) {
      return getGuestAccessToken().then((token) =>
        publicRequest<unknown>(
          `/v1/public/companies/${encodeURIComponent(companySlug)}/reservations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(body),
          },
        ).then((data) => mapReservation(data, companySlug)),
      );
    }

    return getOpenApiClient()
      .POST("/v1/public/companies/{slug}/reservations", {
        params: { path: { slug: companySlug } },
        body: {
          guestName: payload.guestName,
          guestEmail: payload.guestEmail,
          guestPhone: payload.guestPhone,
          vehicleId: payload.vehicleId,
          startDate: payload.startDate,
          endDate: payload.endDate,
          ...(payload.insurancePackageId
            ? { insurancePackageId: payload.insurancePackageId }
            : {}),
        },
      })
      .then(({ data }) => mapReservation(data, companySlug));
  },

  getByToken(token: string): Promise<GuestReservation> {
    return getOpenApiClient()
      .GET("/v1/public/reservations/{token}", {
        params: { path: { token } },
      })
      .then(({ data }) => mapReservation(data));
  },

  withdraw(token: string): Promise<GuestReservation> {
    return publicRequest<unknown>(
      `/v1/public/reservations/${encodeURIComponent(token)}/withdraw`,
      { method: "POST" },
    ).then((data) => mapReservation(data ?? { token }));
  },
};
