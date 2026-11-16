import { describe, expect, it } from "vitest";
import { bookingDraftKey, sanitizeBookingDraft } from "./bookingDraft";

describe("bookingDraftKey", () => {
  it("is scoped per company and car", () => {
    expect(bookingDraftKey("coches", "v1")).toBe("benwer:booking-draft:coches:v1");
  });
});

describe("sanitizeBookingDraft", () => {
  it("keeps known fields with the right types only", () => {
    expect(
      sanitizeBookingDraft({
        guestName: "Ana",
        acceptTerms: true,
        addonIds: ["a", 2, "b"],
        guestPhone: 600,
        unknown: "x",
      }),
    ).toEqual({ guestName: "Ana", acceptTerms: true, addonIds: ["a", "b"] });
  });

  it("rejects non-objects", () => {
    expect(sanitizeBookingDraft("nope")).toBeNull();
    expect(sanitizeBookingDraft(null)).toBeNull();
  });
});
