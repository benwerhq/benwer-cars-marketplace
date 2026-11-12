import { describe, expect, it } from "vitest";
import { defaultPublicUrls, resolvePublicEnvironment } from "./envDefaults";

describe("defaultPublicUrls", () => {
  it("never falls back to production hosts on staging", () => {
    expect(defaultPublicUrls("staging")).toEqual({
      admin: "https://staging.cars-admin.benwer.es",
      marketing: "https://staging.cars.benwer.es",
    });
  });

  it("uses production hosts only for production", () => {
    expect(defaultPublicUrls("production").admin).toBe("https://cars-admin.benwer.es");
  });

  it("uses localhost for local builds", () => {
    expect(defaultPublicUrls("local").admin).toBe("http://localhost:3001");
  });
});

describe("resolvePublicEnvironment", () => {
  it("defaults production builds to production and others to local", () => {
    expect(resolvePublicEnvironment(undefined, "production")).toBe("production");
    expect(resolvePublicEnvironment(undefined, "development")).toBe("local");
    expect(resolvePublicEnvironment("staging", "production")).toBe("staging");
  });
});
