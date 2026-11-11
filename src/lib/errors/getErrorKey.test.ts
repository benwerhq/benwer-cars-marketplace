import { describe, expect, it } from "vitest";
import { ErrorMessages } from "@/enums";
import { ApiError } from "./ApiError";
import { getErrorKey } from "./getErrorKey";

describe("getErrorKey", () => {
  it("maps known site and booking codes to translation keys", () => {
    expect(getErrorKey(new ApiError(400, "reservation.min_lead"))).toBe(
      ErrorMessages.RESERVATION_MIN_LEAD,
    );
    expect(getErrorKey(new ApiError(400, "reservation.terms_required"))).toBe(
      ErrorMessages.RESERVATION_TERMS_REQUIRED,
    );
    expect(getErrorKey(new ApiError(409, "reservation.max_open_requests"))).toBe(
      ErrorMessages.RESERVATION_MAX_OPEN_REQUESTS,
    );
    expect(getErrorKey(new ApiError(410, "reservation.request_expired"))).toBe(
      ErrorMessages.RESERVATION_REQUEST_EXPIRED,
    );
    expect(getErrorKey(new ApiError(409, "site.paused"))).toBe(
      ErrorMessages.SITE_PAUSED,
    );
    expect(getErrorKey(new ApiError(409, "booking.payment_window_elapsed"))).toBe(
      ErrorMessages.BOOKING_PAYMENT_WINDOW_ELAPSED,
    );
    expect(getErrorKey(new ApiError(409, "booking.payment_not_required"))).toBe(
      ErrorMessages.BOOKING_PAYMENT_NOT_REQUIRED,
    );
    expect(getErrorKey(new ApiError(409, "booking.payment_not_open"))).toBe(
      ErrorMessages.BOOKING_PAYMENT_NOT_OPEN,
    );
    expect(getErrorKey(new ApiError(409, "reservation.not_cancellable"))).toBe(
      ErrorMessages.RESERVATION_NOT_CANCELLABLE,
    );
    expect(getErrorKey(new ApiError(409, "rental_payments.already_paid"))).toBe(
      ErrorMessages.RENTAL_PAYMENTS_ALREADY_PAID,
    );
    expect(getErrorKey(new ApiError(404, "website_domain.not_found"))).toBe(
      ErrorMessages.WEBSITE_DOMAIN_NOT_FOUND,
    );
    expect(getErrorKey(new ApiError(503, "guest.not_configured"))).toBe(
      ErrorMessages.GUEST_NOT_CONFIGURED,
    );
    expect(getErrorKey(new ApiError(404, "guest.not_linked"))).toBe(
      ErrorMessages.GUEST_NOT_LINKED,
    );
  });
});
