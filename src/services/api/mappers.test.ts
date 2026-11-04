import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ReservationStatus, VehicleType } from "@/enums";
import {
  mapAvailability,
  mapAvailabilityList,
  mapCompany,
  mapCompanyList,
  mapPriceBreakdown,
  mapReservation,
  mapVehicle,
  mapVehicleList,
  unwrapList,
} from "./mappers";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(fixturesDir, name), "utf8"));
}

describe("unwrapList", () => {
  it("reads response.data from a page envelope", () => {
    expect(
      unwrapList({ data: [{ id: "1" }], page: { total: 1, nextCursor: null } }),
    ).toEqual([{ id: "1" }]);
  });

  it("falls back to a raw array", () => {
    expect(unwrapList([{ id: "1" }])).toEqual([{ id: "1" }]);
  });
});

describe("mapCompanyList", () => {
  it("maps the live companies array", () => {
    const companies = mapCompanyList(loadFixture("companies.list.json"));

    expect(companies).toHaveLength(3);
    expect(companies.map((company) => company.slug)).toEqual([
      "med-rentacar",
      "benetti-cars",
      "sol-y-playa",
    ]);
    expect(companies[0]?.name).toBe("Autoalquiler Mediterráneo");
    expect(companies[0]?.branding.primaryColor).toBe("#7c3aed");
    expect(companies[0]?.locationSlug).toBeNull();
  });

  it("maps a { data, page } companies envelope with location and coordinates", () => {
    const companies = mapCompanyList(loadFixture("companies.page.json"));

    expect(companies.map((company) => company.slug)).toEqual([
      "med-rentacar",
      "benetti-cars",
    ]);
    expect(companies[0]).toMatchObject({
      location: "Málaga",
      locationSlug: "malaga",
      latitude: 36.7213,
      longitude: -4.4214,
      vehicleCount: 12,
    });
  });
});

describe("mapCompany", () => {
  it("maps live company detail and infers a city slug from location", () => {
    const company = mapCompany(loadFixture("companies.detail.json"));
    expect(company.slug).toBe("med-rentacar");
    expect(company.isPublic).toBe(true);

    const withCity = mapCompany({
      slug: "costa-wheels",
      name: "Costa Wheels",
      location: "Torremolinos",
      isPublic: true,
      branding: { primaryColor: "#0369a1", logoUrl: null },
    });
    expect(withCity.locationSlug).toBe("torremolinos");
  });

  it("keeps location slugs outside the Málaga city list", () => {
    const company = mapCompany({
      slug: "valencia-drive",
      name: "Valencia Drive",
      location: "Valencia",
      locationSlug: "valencia",
      isPublic: true,
    });

    expect(company.locationSlug).toBe("valencia");
    expect(company.location).toBe("Valencia");
  });

  it("rewrites LocalStack logo hosts to same-origin /localstack paths", () => {
    const company = mapCompany({
      slug: "med-rentacar",
      name: "Autoalquiler Mediterráneo",
      branding: {
        primaryColor: "#7c3aed",
        logoUrl:
          "http://localhost:4566/public-benwer-cars/seed/logos/med-rentacar.svg",
      },
    });

    expect(company.branding.logoUrl).toBe(
      "/localstack/public-benwer-cars/seed/logos/med-rentacar.svg",
    );
  });

  it("keeps same-origin logo paths for mock and public assets", () => {
    const company = mapCompany({
      slug: "denver-cars",
      name: "Denver Cars",
      branding: {
        logoUrl: "/mock-data/logos/denver-cars.svg",
      },
    });

    expect(company.branding.logoUrl).toBe("/mock-data/logos/denver-cars.svg");
  });

  it("maps optional website and contact fields when the API sends them", () => {
    const company = mapCompany({
      slug: "med-rentacar",
      name: "Autoalquiler Mediterráneo",
      websiteUrl: "https://med.example",
      email: "hello@med.example",
      phone: "+34 600 000 000",
    });

    expect(company.websiteUrl).toBe("https://med.example");
    expect(company.email).toBe("hello@med.example");
    expect(company.phone).toBe("+34 600 000 000");
  });
});

describe("mapVehicleList", () => {
  it("maps live make/dailyRate/category/fuelType fields", () => {
    const vehicles = mapVehicleList(loadFixture("vehicles.list.json"), {
      companySlug: "med-rentacar",
    });

    expect(vehicles).toHaveLength(6);
    expect(vehicles[0]).toMatchObject({
      brand: "Peugeot",
      model: "208",
      type: VehicleType.CAR,
      pricePerDay: 33,
      currency: "EUR",
      companySlug: "med-rentacar",
      photos: [],
      color: "silver",
      deposit: 140,
      category: "economy",
    });
    expect(vehicles.find((vehicle) => vehicle.model === "Ateca")?.type).toBe(
      VehicleType.SUV,
    );
  });

  it("maps mileage from currentMileage when present", () => {
    const vehicle = mapVehicle({
      id: "v-mileage",
      make: "Toyota",
      model: "Corolla",
      currentMileage: 18420,
      color: "white",
      deposit: 300,
      category: "compact",
    });

    expect(vehicle).toMatchObject({
      mileage: 18420,
      color: "white",
      deposit: 300,
      category: "compact",
    });
  });

  it("treats a null vehicle list as empty", () => {
    expect(
      mapVehicleList(loadFixture("vehicles.filtered-type-car.json")),
    ).toEqual([]);
  });

  it("reads photo objects and photoUrl fallbacks", () => {
    const vehicle = mapVehicle({
      id: "v-photo",
      make: "SEAT",
      model: "Ibiza",
      photos: [{ url: "https://cdn.example/a.jpg" }, ""],
      photoUrl: "https://cdn.example/b.jpg",
    });

    expect(vehicle.photos).toEqual([
      "https://cdn.example/a.jpg",
      "https://cdn.example/b.jpg",
    ]);
  });

  it("reads signedUrl and publicUrl photo objects", () => {
    const vehicle = mapVehicle({
      id: "v-signed",
      make: "SEAT",
      model: "Ibiza",
      photos: [
        { publicUrl: "https://cdn.example/public.jpg" },
        { signedUrl: "https://cdn.example/signed.jpg?X-Amz-Signature=abc" },
      ],
    });

    expect(vehicle.photos).toEqual([
      "https://cdn.example/public.jpg",
      "https://cdn.example/signed.jpg?X-Amz-Signature=abc",
    ]);
  });

  it("maps economy, sedan, and other categories to car for display", () => {
    expect(mapVehicle({ id: "1", category: "economy" }).type).toBe(
      VehicleType.CAR,
    );
    expect(mapVehicle({ id: "2", type: "sedan" }).type).toBe(VehicleType.CAR);
    expect(mapVehicle({ id: "3", category: "other" }).type).toBe(
      VehicleType.CAR,
    );
  });

  it("reads vehicle_photo attachments before stock_photo", () => {
    const vehicle = mapVehicle({
      id: "v-attach",
      make: "Peugeot",
      model: "208",
      attachments: [
        { kind: "stock_photo", url: "https://cdn.example/stock.jpg" },
        { kind: "vehicle_photo", publicUrl: "https://cdn.example/real.jpg" },
      ],
    });

    expect(vehicle.photos).toEqual([
      "https://cdn.example/real.jpg",
      "https://cdn.example/stock.jpg",
    ]);
  });

  it("does not invent placeholder photos when the API sends an empty list", () => {
    const vehicle = mapVehicle({
      id: "v-empty",
      make: "Peugeot",
      model: "208",
      photos: [],
    });

    expect(vehicle.photos).toEqual([]);
  });

  it("maps numeric ids and admin image collections", () => {
    const vehicle = mapVehicle({
      id: 42,
      make: "SEAT",
      model: "Ibiza",
      images: [{ publicUrl: "https://cdn.example/admin.jpg" }],
    });

    expect(vehicle.id).toBe("42");
    expect(vehicle.photos).toEqual(["https://cdn.example/admin.jpg"]);
  });

  it("rewrites LocalStack photo hosts to same-origin /localstack paths", () => {
    const vehicle = mapVehicle({
      id: "v-localstack",
      make: "Peugeot",
      model: "208",
      photos: [
        "http://localhost:4566/public-benwer-cars/seed/cars/7.jpg",
        "http://127.0.0.1:4566/public-benwer-cars/seed/cars/8.jpg",
        "vehicles/bare-key.jpg",
        "/mock-data/cars/kept.jpg",
      ],
    });

    expect(vehicle.photos).toEqual([
      "/localstack/public-benwer-cars/seed/cars/7.jpg",
      "/localstack/public-benwer-cars/seed/cars/8.jpg",
      "/mock-data/cars/kept.jpg",
    ]);
  });

  it("maps marketplace aliases and drops photo object keys", () => {
    const vehicles = mapVehicleList(loadFixture("vehicles.page.json"));
    expect(vehicles).toHaveLength(1);
    expect(vehicles[0]).toMatchObject({
      brand: "Peugeot",
      type: VehicleType.CAR,
      pricePerDay: 33,
      fuel: "petrol",
      photos: ["https://cdn.example/a.jpg", "https://cdn.example/b.jpg"],
    });
  });
});

describe("mapAvailability", () => {
  it("maps a free live window to no blocked dates", () => {
    const range = mapAvailability(loadFixture("availability.true.json"), {
      from: "2026-12-01",
      to: "2026-12-05",
    });

    expect(range.vehicleId).toBe("7e000000-0000-7000-8000-000000000006");
    expect(range.unavailableDates).toEqual([]);
  });

  it("expands an unavailable live window into the queried dates", () => {
    const range = mapAvailability(loadFixture("availability.false.json"), {
      from: "2026-09-20",
      to: "2026-10-20",
    });

    expect(range.unavailableDates).toContain("2026-09-20");
    expect(range.unavailableDates).toContain("2026-10-19");
    expect(range.unavailableDates).not.toContain("2026-10-20");
  });

  it("expands conflict ranges from swagger availability shape", () => {
    const range = mapAvailability({
      vehicleId: "v1",
      available: false,
      conflicts: [{ startDate: "2026-09-20", endDate: "2026-09-23" }],
    });

    expect(range.unavailableDates).toEqual([
      "2026-09-20",
      "2026-09-21",
      "2026-09-22",
    ]);
  });

  it("accepts a single live availability object as a list", () => {
    const rows = mapAvailabilityList(loadFixture("availability.true.json"), {
      from: "2026-12-01",
      to: "2026-12-05",
    });
    expect(rows).toHaveLength(1);
  });

  it("maps a fleet availability list envelope", () => {
    const rows = mapAvailabilityList(loadFixture("availability.list.json"), {
      from: "2026-09-20",
      to: "2026-09-22",
    });

    expect(rows).toEqual([
      { vehicleId: "v1", unavailableDates: ["2026-09-20", "2026-09-21"] },
      { vehicleId: "v2", unavailableDates: [] },
    ]);
  });
});

describe("mapReservation", () => {
  it("maps a live created reservation with vehicleMake and totalAmount", () => {
    const reservation = mapReservation(
      loadFixture("reservation.created.json"),
      "med-rentacar",
    );

    expect(reservation.token).toBe("92eb9cbbf4a9ab48390901ac54f1c411");
    expect(reservation.status).toBe(ReservationStatus.CONFIRMED);
    expect(reservation.totalPrice).toBe(165);
    expect(reservation.guestName).toBe("Maria Liveqa");
    expect(reservation.vehicle?.brand).toBe("Peugeot");
    expect(reservation.vehicle?.model).toBe("208");
    expect(reservation.companySlug).toBe("med-rentacar");
  });

  it("maps swagger-like reservation totals and customer fields", () => {
    const reservation = mapReservation(
      {
        id: "res-1",
        status: "confirmed",
        vehicleId: "v1",
        startDate: "2026-12-01",
        endDate: "2026-12-04",
        grandTotal: 99,
        customer: {
          name: "Alex Guest",
          email: "alex@example.com",
          phone: "+34600000000",
        },
        company: { slug: "med-rentacar", name: "Autoalquiler Mediterráneo" },
      },
      "med-rentacar",
    );

    expect(reservation.token).toBe("res-1");
    expect(reservation.status).toBe(ReservationStatus.CONFIRMED);
    expect(reservation.totalPrice).toBe(99);
    expect(reservation.guestName).toBe("Alex Guest");
    expect(reservation.companySlug).toBe("med-rentacar");
  });

  it("maps nested vehicle and company on a token lookup", () => {
    const reservation = mapReservation(loadFixture("reservation.nested.json"));

    expect(reservation.token).toBe("nested-token");
    expect(reservation.vehicle?.brand).toBe("Peugeot");
    expect(reservation.vehicle?.photos).toEqual([
      "https://cdn.example/car.jpg",
    ]);
    expect(reservation.company?.slug).toBe("med-rentacar");
    expect(reservation.company?.latitude).toBe(36.72);
    expect(reservation.companySlug).toBe("med-rentacar");
  });
});

describe("mapPriceBreakdown", () => {
  it("keeps valid segments and season warnings", () => {
    const breakdown = mapPriceBreakdown({
      pricingVersion: 3,
      source: "group",
      totalDays: 3,
      segments: [
        {
          startDate: "2026-07-01",
          endDate: "2026-07-02",
          days: 2,
          seasonId: "s1",
          seasonName: { "en-GB": "Summer", "es-ES": 7 },
          dailyRate: 60,
          weekend: false,
          subtotal: 120,
        },
        { startDate: "2026-07-03", days: 1 },
      ],
      vehicleSubtotal: 120,
      averageDailyRate: 40,
      warnings: [
        { code: "pricing.min_days", seasonId: "s1", limit: 5 },
        { code: "pricing.other", seasonId: "s1", limit: 2 },
      ],
    });

    expect(breakdown?.segments).toHaveLength(1);
    expect(breakdown?.segments[0]?.seasonName).toEqual({ "en-GB": "Summer" });
    expect(breakdown?.warnings).toEqual([
      { code: "pricing.min_days", seasonId: "s1", limit: 5 },
    ]);
  });

  it("returns null when totals or source are missing", () => {
    expect(mapPriceBreakdown({ source: "group", totalDays: 2 })).toBeNull();
    expect(
      mapPriceBreakdown({
        source: "unknown",
        totalDays: 2,
        vehicleSubtotal: 10,
        averageDailyRate: 5,
      }),
    ).toBeNull();
    expect(mapPriceBreakdown(null)).toBeNull();
  });
});
