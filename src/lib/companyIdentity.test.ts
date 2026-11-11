import { describe, expect, it } from "vitest";
import { resolveCardCompany } from "./companyIdentity";
import {
  FuelType,
  TransmissionType,
  VehicleStatus,
  VehicleType,
} from "@/enums";
import type { Company } from "@/types/company";
import type { MarketplaceVehicle } from "@/types/vehicle";

const vehicle = {
  id: "v1",
  companySlug: "med-rentacar",
  brand: "Peugeot",
  model: "208",
  year: 2023,
  type: VehicleType.CAR,
  transmission: TransmissionType.AUTOMATIC,
  fuel: FuelType.PETROL,
  seats: 5,
  pricePerDay: 33,
  currency: "EUR",
  status: VehicleStatus.AVAILABLE,
  isPublic: true,
  photos: [],
  description: null,
  color: null,
  deposit: null,
  category: null,
  mileage: null,
  branchId: null,
};

const listed: Company = {
  id: "2",
  slug: "med-rentacar",
  name: "Autoalquiler Mediterráneo",
  description: null,
  location: "Málaga",
  locationSlug: "malaga",
  latitude: null,
  longitude: null,
  vehicleCount: 6,
  isPublic: true,
  websiteUrl: null,
  email: null,
  phone: null,
  address: null,
  branding: {
    primaryColor: "#7c3aed",
    logoUrl: "/localstack/public-benwer-cars/seed/logos/med-rentacar.svg",
  },
};

describe("resolveCardCompany", () => {
  it("prefers a nested company and fills a missing logo from the directory", () => {
    const marketplaceVehicle: MarketplaceVehicle = {
      ...vehicle,
      company: {
        ...listed,
        branding: { primaryColor: "#7c3aed", logoUrl: null },
      },
    };

    expect(
      resolveCardCompany(marketplaceVehicle, [listed])?.branding.logoUrl,
    ).toBe("/localstack/public-benwer-cars/seed/logos/med-rentacar.svg");
    expect(resolveCardCompany(marketplaceVehicle, [listed])?.name).toBe(
      "Autoalquiler Mediterráneo",
    );
  });

  it("uses the directory when the vehicle has no nested company", () => {
    expect(resolveCardCompany(vehicle, [listed])).toMatchObject({
      slug: "med-rentacar",
      name: "Autoalquiler Mediterráneo",
      branding: {
        logoUrl: "/localstack/public-benwer-cars/seed/logos/med-rentacar.svg",
      },
    });
  });
});
