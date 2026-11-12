import { describe, expect, it } from "vitest";
import {
  FuelType,
  TransmissionType,
  VehicleCategory,
  VehicleSort,
  VehicleStatus,
  VehicleType,
} from "@/enums";
import type { Vehicle } from "@/types/vehicle";
import {
  applyVehicleFilters,
  clearAdvancedFilters,
  countAdvancedFilters,
  fleetFetchFilters,
  marketplaceFetchFilters,
  parseVehicleFilters,
  refineVehicles,
  seatOptionsOf,
  vehicleCategoryOf,
} from "./vehicleFilters";

function vehicle(overrides: Partial<Vehicle>): Vehicle {
  return {
    id: "v",
    companySlug: "acme",
    brand: "Seat",
    model: "Ibiza",
    year: 2024,
    type: VehicleType.CAR,
    transmission: TransmissionType.MANUAL,
    fuel: FuelType.PETROL,
    seats: 5,
    pricePerDay: 30,
    currency: "EUR",
    status: VehicleStatus.AVAILABLE,
    isPublic: true,
    photos: [],
    description: null,
    color: null,
    deposit: null,
    category: VehicleCategory.ECONOMY,
    mileage: null,
    branchId: null,
    ...overrides,
  };
}

describe("parseVehicleFilters", () => {
  it("parses comma-separated multi-value filters and drops unknown values", () => {
    const filters = parseVehicleFilters(
      new URLSearchParams(
        "category=suv,economy,bogus&fuel=diesel,plugin_hybrid&transmission=automatic&seats=7,5,x&sort=pricePerDay:asc&q=golf",
      ),
    );

    expect(filters.categories).toEqual([
      VehicleCategory.SUV,
      VehicleCategory.ECONOMY,
    ]);
    expect(filters.fuels).toEqual([FuelType.DIESEL, FuelType.PLUGIN_HYBRID]);
    expect(filters.transmissions).toEqual([TransmissionType.AUTOMATIC]);
    expect(filters.seats).toEqual([5, 7]);
    expect(filters.sort).toBe(VehicleSort.PRICE_ASC);
    expect(filters.q).toBe("golf");
  });

  it("maps the legacy type param onto categories", () => {
    expect(
      parseVehicleFilters(new URLSearchParams("type=suv")).categories,
    ).toEqual([VehicleCategory.SUV]);
    expect(
      parseVehicleFilters(new URLSearchParams("type=car")).categories,
    ).toBeUndefined();
  });

  it("ignores an unknown sort", () => {
    expect(
      parseVehicleFilters(new URLSearchParams("sort=plate:asc")).sort,
    ).toBeUndefined();
  });
});

describe("applyVehicleFilters", () => {
  it("round-trips through the URL and drops the legacy type param", () => {
    const params = applyVehicleFilters(new URLSearchParams("type=suv&x=1"), {
      categories: [VehicleCategory.SEDAN, VehicleCategory.VAN],
      fuels: [FuelType.ELECTRIC],
      seats: [4, 7],
      sort: VehicleSort.PRICE_DESC,
      q: "  tesla ",
    });

    expect(params.get("type")).toBeNull();
    expect(params.get("x")).toBe("1");
    expect(params.get("category")).toBe("sedan,van");
    expect(params.get("fuel")).toBe("electric");
    expect(params.get("seats")).toBe("4,7");
    expect(params.get("sort")).toBe("pricePerDay:desc");
    expect(params.get("q")).toBe("tesla");
    expect(parseVehicleFilters(params).categories).toEqual([
      VehicleCategory.SEDAN,
      VehicleCategory.VAN,
    ]);
  });
});

describe("filter counts", () => {
  it("counts every selected value and keeps dates and sort on clear", () => {
    const filters = {
      categories: [VehicleCategory.SUV, VehicleCategory.VAN],
      fuels: [FuelType.DIESEL],
      q: "golf",
      companySlugs: ["acme"],
      from: "2026-12-01",
      to: "2026-12-05",
      sort: VehicleSort.PRICE_ASC,
    };

    expect(countAdvancedFilters(filters)).toBe(5);
    expect(clearAdvancedFilters(filters)).toEqual({
      from: "2026-12-01",
      to: "2026-12-05",
      branchId: undefined,
      sort: VehicleSort.PRICE_ASC,
    });
  });
});

describe("fetch filters", () => {
  it("keeps only the fields that change what the API returns", () => {
    expect(
      fleetFetchFilters({
        categories: [VehicleCategory.SUV],
        q: "golf",
        from: "2026-12-01",
        branchId: "b1",
      }),
    ).toEqual({
      from: "2026-12-01",
      to: undefined,
      branchId: "b1",
      channel: undefined,
    });
    expect(
      marketplaceFetchFilters({
        location: "malaga",
        companySlugs: ["acme"],
        seats: [5],
      }),
    ).toEqual({
      location: "malaga",
      from: undefined,
      to: undefined,
      branchId: undefined,
    });
  });
});

describe("refineVehicles", () => {
  const cheapSuv = vehicle({
    id: "suv",
    category: VehicleCategory.SUV,
    pricePerDay: 40,
    fuel: FuelType.HYBRID,
    transmission: TransmissionType.AUTOMATIC,
  });
  const van = vehicle({
    id: "van",
    category: null,
    type: VehicleType.VAN,
    seats: 9,
    pricePerDay: 90,
    companySlug: "other",
  });
  const compact = vehicle({ id: "compact", brand: "Škoda", model: "Fabia" });
  const fleet = [van, cheapSuv, compact];

  it("matches any of the selected values within a filter", () => {
    expect(
      refineVehicles(fleet, {
        categories: [VehicleCategory.SUV, VehicleCategory.VAN],
      }).map((row) => row.id),
    ).toEqual(["van", "suv"]);
  });

  it("combines filters across fields", () => {
    expect(
      refineVehicles(fleet, {
        categories: [VehicleCategory.SUV, VehicleCategory.VAN],
        transmissions: [TransmissionType.AUTOMATIC],
      }).map((row) => row.id),
    ).toEqual(["suv"]);
  });

  it("filters by exact seats, company and accent-insensitive search", () => {
    expect(refineVehicles(fleet, { seats: [9] }).map((row) => row.id)).toEqual([
      "van",
    ]);
    expect(
      refineVehicles(fleet, { companySlugs: ["other"] }).map((row) => row.id),
    ).toEqual(["van"]);
    expect(refineVehicles(fleet, { q: "skoda" }).map((row) => row.id)).toEqual(
      ["compact"],
    );
  });

  it("sorts by price", () => {
    expect(
      refineVehicles(fleet, { sort: VehicleSort.PRICE_ASC }).map(
        (row) => row.id,
      ),
    ).toEqual(["compact", "suv", "van"]);
    expect(
      refineVehicles(fleet, { sort: VehicleSort.PRICE_DESC }).map(
        (row) => row.id,
      ),
    ).toEqual(["van", "suv", "compact"]);
  });

  it("derives the category from the type when the API sends none", () => {
    expect(vehicleCategoryOf(van)).toBe(VehicleCategory.VAN);
    expect(vehicleCategoryOf(vehicle({ category: "compact" }))).toBe(
      VehicleCategory.OTHER,
    );
  });

  it("lists distinct seat counts ascending", () => {
    expect(seatOptionsOf(fleet)).toEqual([5, 9]);
  });
});
