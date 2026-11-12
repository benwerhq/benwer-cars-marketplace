import { describe, expect, it } from "vitest";
import type { Company } from "@/types/company";
import {
  branchOptionsFromCompanies,
  companyForBranch,
  filterBranchOptions,
  returnBranchOptions,
} from "./branchOptions";

function company(overrides: Partial<Company>): Company {
  return {
    id: "c",
    slug: "c",
    name: "C",
    description: null,
    location: null,
    locationSlug: null,
    latitude: null,
    longitude: null,
    vehicleCount: 3,
    isPublic: true,
    websiteUrl: null,
    email: null,
    phone: null,
    address: null,
    branding: { primaryColor: "", logoUrl: null },
    branches: [],
    allowDifferentReturn: false,
    ...overrides,
  };
}

const acme = company({
  slug: "acme",
  name: "Acme",
  allowDifferentReturn: true,
  branches: [
    { id: "a2", name: "Málaga Airport", address: "Terminal 3" },
    { id: "a1", name: "Centre", address: "Calle Larios 10" },
  ],
});
const solo = company({
  slug: "solo",
  name: "Solo",
  branches: [{ id: "s1", name: "Airport desk", address: "Arrivals" }],
});
const empty = company({
  slug: "empty",
  vehicleCount: 0,
  branches: [{ id: "e1", name: "Ghost", address: "" }],
});

describe("branchOptionsFromCompanies", () => {
  it("lists every branch of companies with cars, sorted by name", () => {
    const options = branchOptionsFromCompanies([acme, solo, empty], "en-GB");
    expect(options.map((option) => option.id)).toEqual(["s1", "a1", "a2"]);
    expect(options[0]).toMatchObject({ companySlug: "solo", companyName: "Solo" });
  });
});

describe("filterBranchOptions", () => {
  const options = branchOptionsFromCompanies([acme, solo], "en-GB");

  it("matches name, address or company, ignoring accents and case", () => {
    expect(filterBranchOptions(options, "malaga").map((o) => o.id)).toEqual(["a2"]);
    expect(filterBranchOptions(options, "LARIOS").map((o) => o.id)).toEqual(["a1"]);
    expect(filterBranchOptions(options, "solo").map((o) => o.id)).toEqual(["s1"]);
    expect(filterBranchOptions(options, "  ")).toHaveLength(3);
  });
});

describe("return branches", () => {
  it("finds the branch owner and offers its branches when it allows a different return", () => {
    expect(companyForBranch([acme, solo], "s1")?.slug).toBe("solo");
    expect(companyForBranch([acme, solo], undefined)).toBeUndefined();
    expect(returnBranchOptions(acme).map((option) => option.id)).toEqual(["a2", "a1"]);
    expect(returnBranchOptions(solo)).toEqual([]);
    expect(returnBranchOptions(company({ allowDifferentReturn: true, branches: solo.branches }))).toEqual([]);
    expect(returnBranchOptions(undefined)).toEqual([]);
  });
});
