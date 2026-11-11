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
  });
});
