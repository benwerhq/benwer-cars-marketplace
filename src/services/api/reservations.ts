import type {
  CreateGuestReservationPayload,
  GuestReservation,
} from "@/types/reservation";
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
      return publicRequest<unknown>(
        `/v1/public/companies/${encodeURIComponent(companySlug)}/reservations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      ).then((data) => mapReservation(data, companySlug));
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
