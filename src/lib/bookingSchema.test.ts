import { describe, expect, it } from "vitest";
import { createBookingSchema } from "./bookingSchema";

const base = {
  nameMin: "name",
  email: "email",
  phone: "phone",
  startDate: "start",
  endDate: "end",
  endAfterStart: "order",
};

describe("createBookingSchema", () => {
  it("does not require terms unless a terms message is provided", () => {
    const parsed = createBookingSchema(base).safeParse({
      guestName: "Jane Smith",
      guestEmail: "jane@example.com",
      guestPhone: "+34 600 000 000",
      startDate: "2026-09-20",
      endDate: "2026-09-24",
      acceptTerms: false,
    });
    expect(parsed.success).toBe(true);
  });

  it("requires acceptTerms and E.164 phone on the website channel", () => {
    const schema = createBookingSchema(
      { ...base, terms: "accept" },
      { website: true },
    );

    expect(
      schema.safeParse({
        guestName: "Jane Smith",
        guestEmail: "jane@example.com",
        guestPhone: "+34600000000",
        startDate: "2026-09-20",
        endDate: "2026-09-24",
        acceptTerms: false,
      }).success,
    ).toBe(false);

    expect(
      schema.safeParse({
        guestName: "Jane Smith",
        guestEmail: "jane@example.com",
        guestPhone: "+34 600 000 000",
        startDate: "2026-09-20",
        endDate: "2026-09-24",
        acceptTerms: true,
      }).success,
    ).toBe(true);
  });
});
