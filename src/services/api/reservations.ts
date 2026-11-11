import type { components } from "./schema";
import type {
  CreateGuestReservationPayload,
  GuestReservation,
} from "@/types/reservation";
import { getOpenApiClient, publicRequest } from "./client";
import { mapReservation } from "./mappers";

export const reservationsApi = {
  create(
    companySlug: string,
    payload: CreateGuestReservationPayload,
  ): Promise<GuestReservation> {
    return getOpenApiClient()
      .POST("/v1/public/companies/{slug}/reservations", {
        params: { path: { slug: companySlug } },
        body: payload as components["schemas"]["CreateGuestReservationDto"],
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
