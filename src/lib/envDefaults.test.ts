import { describe, expect, it } from "vitest";
import { defaultPublicUrls, resolvePublicEnvironment } from "./envDefaults";

describe("defaultPublicUrls", () => {
  it("never falls back to production hosts on staging", () => {
    expect(defaultPublicUrls("staging")).toEqual({
      admin: "https://staging.cars-admin.benwer.es",
      marketing: "https://staging.benwer.es",
      app: "https://staging.cars.benwer.es",
      marketplaceDomain: "staging.benwer.es",
    });
  });

  it("uses production hosts only for production", () => {
    expect(defaultPublicUrls("production")).toEqual({
      admin: "https://cars-admin.benwer.es",
      marketing: "https://benwer.es",
      app: "https://cars.benwer.es",
      marketplaceDomain: "benwer.es",
    });
  });

  it("uses localhost for local builds", () => {
    expect(defaultPublicUrls("local")).toEqual({
      admin: "http://localhost:3001",
      marketing: "http://localhost:3000",
      app: "http://localhost:3002",
      marketplaceDomain: "benwer.es",
    });
  });
});

describe("resolvePublicEnvironment", () => {
  it("defaults production builds to production and others to local", () => {
    expect(resolvePublicEnvironment(undefined, "production")).toBe("production");
    expect(resolvePublicEnvironment(undefined, "development")).toBe("local");
    expect(resolvePublicEnvironment("staging", "production")).toBe("staging");
  });
});
