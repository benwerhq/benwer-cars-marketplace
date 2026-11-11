import { describe, expect, it } from "vitest";
import {
  isPlatformHost,
  normalizeRequestHost,
  resolvePlatformTenantSlug,
} from "./platformHost";

describe("isPlatformHost", () => {
  it("treats marketplace, vercel, localhost and benwer subdomains as platform", () => {
    expect(isPlatformHost("marketplace.benwer.es", "benwer.es")).toBe(true);
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
    expect(resolvePlatformTenantSlug("reservas.acme.es", "benwer.es")).toBe(
      null,
    );
  });
});

describe("normalizeRequestHost", () => {
  it("strips port and case", () => {
    expect(normalizeRequestHost("Reservas.Acme.es:443")).toBe("reservas.acme.es");
  });
});
