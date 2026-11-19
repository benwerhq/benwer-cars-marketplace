import { describe, expect, it } from "vitest";
import {
  companySubdomainOrigin,
  isMarketplaceFrontDoor,
  isPlatformHost,
  isReservedPlatformSlug,
  normalizeRequestHost,
  parseSiteFallbackPath,
  resolvePlatformTenantSlug,
  usesCompanySubdomains,
} from "./platformHost";

describe("isPlatformHost", () => {
  it("treats marketplace, vercel, localhost and benwer subdomains as platform", () => {
    expect(isPlatformHost("marketplace.benwer.es", "benwer.es")).toBe(true);
    expect(isPlatformHost("cars.benwer.es", "benwer.es")).toBe(true);
    expect(isPlatformHost("www.benwer.es", "benwer.es")).toBe(true);
    expect(isPlatformHost("benwer.es", "benwer.es")).toBe(true);
    expect(isPlatformHost("denver-cars.benwer.es", "benwer.es")).toBe(true);
    expect(isPlatformHost("app.vercel.app", "benwer.es")).toBe(true);
    expect(isPlatformHost("localhost", "benwer.es")).toBe(true);
    expect(isPlatformHost("127.0.0.1", "benwer.es")).toBe(true);
  });

  it("does not treat a company custom domain as a platform host", () => {
    expect(isPlatformHost("reservas.acme.es", "benwer.es")).toBe(false);
    expect(isPlatformHost("book.denver-cars.com", "benwer.es")).toBe(false);
  });
});

describe("resolvePlatformTenantSlug", () => {
  it("reads the company slug from a platform subdomain only", () => {
    expect(resolvePlatformTenantSlug("denver-cars.benwer.es", "benwer.es")).toBe(
      "denver-cars",
    );
    expect(resolvePlatformTenantSlug("marketplace.benwer.es", "benwer.es")).toBe(
      null,
    );
    expect(resolvePlatformTenantSlug("cars.benwer.es", "benwer.es")).toBe(null);
    expect(resolvePlatformTenantSlug("www.benwer.es", "benwer.es")).toBe(null);
    expect(resolvePlatformTenantSlug("staging.benwer.es", "benwer.es")).toBe(
      null,
    );
    expect(resolvePlatformTenantSlug("reservas.acme.es", "benwer.es")).toBe(
      null,
    );
  });

  it("keeps the APP_URL marketplace host when the tenant base is a parent domain", () => {
    const extra = {
      extraHosts: ["staging.cars.benwer.es"],
    };
    expect(
      isPlatformHost("staging.cars.benwer.es", "staging.benwer.es", extra),
    ).toBe(true);
    expect(
      resolvePlatformTenantSlug(
        "staging.cars.benwer.es",
        "staging.benwer.es",
        extra,
      ),
    ).toBe(null);
    expect(
      resolvePlatformTenantSlug(
        "benwerhq.staging.benwer.es",
        "staging.benwer.es",
        extra,
      ),
    ).toBe("benwerhq");
  });

  it("treats cars.benwer.es as the marketplace front door", () => {
    expect(isMarketplaceFrontDoor("cars.benwer.es", "benwer.es")).toBe(true);
    expect(isMarketplaceFrontDoor("benwerhq.benwer.es", "benwer.es")).toBe(
      false,
    );
    expect(isMarketplaceFrontDoor("coches.benwer.es", "benwer.es")).toBe(false);
  });
});

describe("reserved platform slugs", () => {
  it("reserves cars, www, staging and marketplace", () => {
    expect(isReservedPlatformSlug("cars")).toBe(true);
    expect(isReservedPlatformSlug("www")).toBe(true);
    expect(isReservedPlatformSlug("staging")).toBe(true);
    expect(isReservedPlatformSlug("marketplace")).toBe(true);
    expect(isReservedPlatformSlug("benwerhq")).toBe(false);
    expect(isReservedPlatformSlug("coches")).toBe(false);
  });
});

describe("normalizeRequestHost", () => {
  it("strips port and case", () => {
    expect(normalizeRequestHost("Reservas.Acme.es:443")).toBe("reservas.acme.es");
  });
});

describe("parseSiteFallbackPath", () => {
  it("splits /s/{slug} and the remaining path", () => {
    expect(parseSiteFallbackPath("/s/acme")).toEqual({ slug: "acme", rest: "" });
    expect(parseSiteFallbackPath("/s/acme/owner")).toEqual({
      slug: "acme",
      rest: "/owner",
    });
    expect(parseSiteFallbackPath("/companies/acme")).toBeNull();
  });
});

describe("usesCompanySubdomains", () => {
  it("is off on loopback unless the tenant domain is localhost", () => {
    expect(usesCompanySubdomains("localhost", "benwer.es")).toBe(false);
    expect(usesCompanySubdomains("localhost", "localhost")).toBe(true);
    expect(
      usesCompanySubdomains(
        "staging.cars.benwer.es",
        "staging.benwer.es",
      ),
    ).toBe(true);
  });
});

describe("companySubdomainOrigin", () => {
  it("builds https://{slug}.{domain} for public hosts", () => {
    expect(
      companySubdomainOrigin(
        "acme",
        "staging.benwer.es",
        "https://staging.cars.benwer.es",
      ),
    ).toBe("https://acme.staging.benwer.es");
  });
});

describe("platformLabel escaping", () => {
  it("treats regex metacharacters in the marketplace domain as literal", () => {
    expect(resolvePlatformTenantSlug("acme.benwer+es", "benwer+es")).toBe("acme");
    expect(resolvePlatformTenantSlug("acme.benweres", "benwer+es")).toBe(null);
  });
});
