import type {
  CreateGuestPaymentPayload,
  GuestCancellationQuote,
  GuestPayment,
} from "@/types/payment";
import type { GuestReservation } from "@/types/reservation";
import { publicRequest } from "./client";
import { mapCancellationQuote, mapGuestPayment } from "./mappers";
import { reservationsApi } from "./reservations";

function paymentPath(token: string, suffix = ""): string {
  return `/v1/public/reservations/${encodeURIComponent(token)}${suffix}`;
}

export const guestPaymentsApi = {
  create(
    token: string,
    payload: CreateGuestPaymentPayload = {},
  ): Promise<GuestPayment> {
    const body: Record<string, string> = {};
    if (payload.successUrl) {
      body.successUrl = payload.successUrl;
    }
    if (payload.cancelUrl) {
      body.cancelUrl = payload.cancelUrl;
    }

    return publicRequest<unknown>(paymentPath(token, "/payments"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(mapGuestPayment);
  },

  get(token: string): Promise<GuestPayment> {
    return publicRequest<unknown>(paymentPath(token, "/payments")).then(
      mapGuestPayment,
    );
  },

  cancellationQuote(token: string): Promise<GuestCancellationQuote> {
    return publicRequest<unknown>(
      paymentPath(token, "/cancellation-quote"),
    ).then(mapCancellationQuote);
  },

  async cancel(token: string): Promise<GuestReservation> {
    await publicRequest<unknown>(paymentPath(token, "/cancel"), {
      method: "POST",
    });
    return reservationsApi.getByToken(token);
  },
};
