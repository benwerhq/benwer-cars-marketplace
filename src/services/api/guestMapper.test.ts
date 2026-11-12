import { describe, expect, it } from "vitest";
import { mapGuestAccount, mapGuestCustomer, mapReservation } from "./mappers";

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

describe("mapReservation insurance", () => {
  it("adds the insurance total to the vehicle subtotal", () => {
    const reservation = mapReservation({
      token: "t1",
      totalAmount: 126,
      insurance: { code: "MEDIUM", name: { en: "Medium" }, total: 24 },
    });
    expect(reservation.totalPrice).toBe(150);
    expect(reservation.insurance).toEqual({ code: "MEDIUM", name: { en: "Medium" }, total: 24 });
  });

  it("uses a grand total as is when the API sends one", () => {
    expect(
      mapReservation({ grandTotal: 170, totalAmount: 126, insurance: { total: 24 } }).totalPrice,
    ).toBe(170);
  });

  it("falls back to car plus insurance when grandTotal is null", () => {
    const reservation = mapReservation({
      grandTotal: null,
      totalAmount: 126,
      extrasTotal: null,
      insurance: { total: 24 },
    });
    expect(reservation.totalPrice).toBe(150);
    expect(reservation.extrasTotal).toBeNull();
  });

  it("maps extras, fees, times and the car year from the API", () => {
    const reservation = mapReservation({
      grandTotal: 180,
      totalAmount: 126,
      extrasTotal: 15,
      feesTotal: 15,
      pickupTime: "10:00",
      returnTime: null,
      vehicleMake: "SEAT",
      vehicleModel: "Leon",
      vehicleYear: 2023,
      guestPhone: "+34600000000",
      insurance: { total: 24 },
    });
    expect(reservation).toMatchObject({
      totalPrice: 180,
      extrasTotal: 15,
      feesTotal: 15,
      pickupTime: "10:00",
      returnTime: null,
      guestPhone: "+34600000000",
    });
    expect(reservation.vehicle?.year).toBe(2023);
  });
});

describe("mapGuestCustomer", () => {
  it("keeps only the date part of a date of birth", () => {
    expect(mapGuestCustomer({ id: "c1", dateOfBirth: "1990-04-01T00:00:00.000Z" })?.dateOfBirth).toBe(
      "1990-04-01",
    );
  });
});
