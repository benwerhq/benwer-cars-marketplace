import { describe, expect, it } from "vitest";
import { mapGuestAccount, mapGuestCustomer } from "./mappers";

describe("mapGuestAccount", () => {
  it("maps the linked customer used to prefill bookings", () => {
    expect(
      mapGuestAccount(
        {
          id: "g1",
          email: "ana@example.com",
          emailVerified: true,
          linked: true,
          customer: {
            id: "c1",
            fullName: "Ana Lopez",
            email: "ana@example.com",
            phone: "+34600000000",
          },
        },
        "coches",
      ),
    ).toEqual({
      email: "ana@example.com",
      linked: true,
      companySlug: "coches",
      emailVerified: true,
      customer: {
        id: "c1",
        fullName: "Ana Lopez",
        email: "ana@example.com",
        phone: "+34600000000",
      },
    });
  });

  it("has no customer when the guest is not linked", () => {
    expect(mapGuestAccount({ email: "a@b.c", linked: false, customer: null }).customer).toBeNull();
  });
});

describe("mapGuestCustomer", () => {
  it("keeps only the date part of a date of birth", () => {
    expect(mapGuestCustomer({ id: "c1", dateOfBirth: "1990-04-01T00:00:00.000Z" })?.dateOfBirth).toBe(
      "1990-04-01",
    );
  });
});
