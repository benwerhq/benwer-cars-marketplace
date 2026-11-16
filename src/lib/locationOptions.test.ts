import { describe, expect, it } from "vitest";
import {
  filterInventoryLocations,
  inventoryLocationsFromCompanies,
  slugifyLocation,
} from "./locationOptions";
import type { Company } from "@/types/company";

function company(
  partial: Partial<Company> & Pick<Company, "slug" | "name">,
): Company {
  return {
    id: partial.id ?? partial.slug,
    slug: partial.slug,
    name: partial.name,
    description: null,
    location: partial.location ?? null,
    locationSlug: partial.locationSlug ?? null,
    latitude: null,
    longitude: null,
    vehicleCount: partial.vehicleCount ?? 3,
    isPublic: true,
    websiteUrl: partial.websiteUrl ?? null,
    email: partial.email ?? null,
    phone: partial.phone ?? null,
    address: partial.address ?? null,
    branding: { primaryColor: "", logoUrl: null },
    branches: [],
    allowDifferentReturn: false,
  };
}

describe("inventoryLocationsFromCompanies", () => {
  it("builds options from inventory and skips empty fleets and the all-locations slug", () => {
    const locations = inventoryLocationsFromCompanies(
      [
        company({
          slug: "med-rentacar",
          name: "Autoalquiler Mediterráneo",
          location: "Málaga",
          locationSlug: "malaga",
          vehicleCount: 6,
        }),
        company({
          slug: "costa-wheels",
          name: "Costa Wheels",
          location: "Torremolinos",
          locationSlug: "torremolinos",
          vehicleCount: 2,
        }),
        company({
          slug: "valencia-drive",
          name: "Valencia Drive",
          location: "Valencia",
          locationSlug: "valencia",
          vehicleCount: 4,
        }),
        company({
          slug: "bilbao-cars",
          name: "Bilbao Cars",
          location: "Bilbao",
          locationSlug: null,
          vehicleCount: 1,
        }),
        company({
          slug: "empty-fleet",
          name: "Empty Fleet",
          location: "Nerja",
          locationSlug: "nerja",
          vehicleCount: 0,
        }),
      ],
      "en-GB",
    );

    expect(locations.map((location) => location.slug)).toEqual([
      "bilbao",
      "torremolinos",
      "valencia",
    ]);
    expect(
      locations.find((location) => location.slug === "valencia")?.label,
    ).toBe("Valencia");
    expect(
      locations.find((location) => location.slug === "bilbao")?.label,
    ).toBe("Bilbao");
  });

  it("filters by label or slug", () => {
    const options = [
      { slug: "valencia", label: "Valencia" },
      { slug: "torremolinos", label: "Torremolinos" },
    ];

    expect(
      filterInventoryLocations(options, "valen").map((item) => item.slug),
    ).toEqual(["valencia"]);
  });
});

describe("slugifyLocation", () => {
  it("slugifies display names outside the Málaga list", () => {
    expect(slugifyLocation("Valencia")).toBe("valencia");
    expect(slugifyLocation("Bilbao")).toBe("bilbao");
  });
});
