import { describe, expect, it } from "vitest";
import { siteCanonicalPageUrl } from "./canonicalUrl";

describe("siteCanonicalPageUrl", () => {
  it("keeps /s/{slug} when canonical is the platform site URL", () => {
    expect(
      siteCanonicalPageUrl(
        "https://cars.benwer.es/s/acme",
        "/s/acme/cars/v1",
        "acme",
      ),
    ).toBe("https://cars.benwer.es/s/acme/cars/v1");
  });

  it("uses the custom origin without /s/{slug}", () => {
    expect(
      siteCanonicalPageUrl("https://reservas.acme.es", "/s/acme", "acme"),
    ).toBe("https://reservas.acme.es/");
    expect(
      siteCanonicalPageUrl(
        "https://reservas.acme.es",
        "/s/acme/cars/v1",
        "acme",
      ),
    ).toBe("https://reservas.acme.es/cars/v1");
  });
});
