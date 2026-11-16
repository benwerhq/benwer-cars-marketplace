import { describe, expect, it } from "vitest";
import { buildCompanySiteHref, buildCompanySiteOrigin } from "./companySite";

describe("buildCompanySiteOrigin", () => {
  it("builds https://{slug}.{marketplaceDomain} for public domains", () => {
    expect(buildCompanySiteOrigin("med-rentacar")).toBe(
      "https://med-rentacar.benwer.es",
    );
  });
});

describe("buildCompanySiteHref", () => {
  it("prefers an absolute website URL and appends dates", () => {
    expect(
      buildCompanySiteHref({
        slug: "med-rentacar",
        websiteUrl: "https://med.example/fleet",
        from: "2026-09-20",
        to: "2026-09-24",
      }),
    ).toBe("https://med.example/fleet?from=2026-09-20&to=2026-09-24");
  });

  it("keeps the car path and query on the company website", () => {
    expect(
      buildCompanySiteHref({
        slug: "med-rentacar",
        websiteUrl: "https://med.example/",
        path: "/cars/v1",
        from: "2026-09-20",
        to: "2026-09-24",
        params: { age: "18-24" },
      }),
    ).toBe("https://med.example/cars/v1?from=2026-09-20&to=2026-09-24&age=18-24");
  });

  it("falls back to the marketplace /s/{slug} live URL", () => {
    expect(
      buildCompanySiteHref({
        slug: "denver-cars",
        path: "/cars/v1",
        from: "2026-09-20",
        to: "2026-09-24",
      }),
    ).toBe(
      "http://localhost:3002/s/denver-cars/cars/v1?from=2026-09-20&to=2026-09-24",
    );
  });
});
