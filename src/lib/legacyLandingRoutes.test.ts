import { describe, expect, it } from "vitest";
import {
  isMarketplaceOwnLegalPath,
  LEGACY_LANDING_HOSTS,
  legacyLandingRedirects,
  legacyLandingRewrites,
} from "./legacyLandingRoutes";

function rulesForHost<T extends { has: { value: string }[] }>(
  rules: T[],
  host: string,
): T[] {
  return rules.filter((rule) => rule.has.some((entry) => entry.value === host));
}

describe("legacyLandingRedirects", () => {
  it("scopes every rule to cars.benwer.es or staging.cars.benwer.es", () => {
    const hosts = new Set(
      legacyLandingRedirects().flatMap((rule) =>
        rule.has.map((entry) => entry.value),
      ),
    );
    expect([...hosts].sort()).toEqual([
      "cars.benwer.es",
      "staging.cars.benwer.es",
    ]);
  });

  it("sends printed QR paths from cars.benwer.es to benwer.es with 308", () => {
    const rules = rulesForHost(legacyLandingRedirects(), "cars.benwer.es");
    expect(rules).toContainEqual({
      source: "/investors.html",
      destination: "https://benwer.es/investors.html",
      statusCode: 308,
      has: [{ type: "host", value: "cars.benwer.es" }],
    });
    expect(rules).toContainEqual({
      source: "/investors/:path*",
      destination: "https://benwer.es/investors/:path*",
      statusCode: 308,
      has: [{ type: "host", value: "cars.benwer.es" }],
    });
  });

  it("mirrors investors, locale and admin rules on staging.cars.benwer.es", () => {
    const rules = rulesForHost(
      legacyLandingRedirects(),
      "staging.cars.benwer.es",
    );
    expect(rules).toContainEqual({
      source: "/investors.html",
      destination: "https://staging.benwer.es/investors.html",
      statusCode: 308,
      has: [{ type: "host", value: "staging.cars.benwer.es" }],
    });
    expect(rules).toContainEqual({
      source: "/:locale(es-ES|en-GB|pt-PT|es|en|pt)",
      destination: "https://staging.benwer.es/:locale",
      statusCode: 308,
      has: [{ type: "host", value: "staging.cars.benwer.es" }],
    });
    expect(rules).toContainEqual({
      source: "/:path(login|signup|checkout|onboarding|invite)",
      destination: "https://staging.cars-admin.benwer.es/:path",
      statusCode: 308,
      has: [{ type: "host", value: "staging.cars.benwer.es" }],
    });
  });

  it("redirects locale marketing paths and admin auth paths on production", () => {
    const rules = rulesForHost(legacyLandingRedirects(), "cars.benwer.es");
    expect(rules).toContainEqual({
      source: "/:locale(es-ES|en-GB|pt-PT|es|en|pt)",
      destination: "https://benwer.es/:locale",
      statusCode: 308,
      has: [{ type: "host", value: "cars.benwer.es" }],
    });
    expect(rules).toContainEqual({
      source: "/:locale(es-ES|en-GB|pt-PT|es|en|pt)/:path*",
      destination: "https://benwer.es/:locale/:path*",
      statusCode: 308,
      has: [{ type: "host", value: "cars.benwer.es" }],
    });
    expect(rules).toContainEqual({
      source: "/:path(login|signup|checkout|onboarding|invite)",
      destination: "https://cars-admin.benwer.es/:path",
      statusCode: 308,
      has: [{ type: "host", value: "cars.benwer.es" }],
    });
  });

  it("does not redirect the marketplace's unprefixed legal pages", () => {
    const sources = legacyLandingRedirects().map((rule) => rule.source);
    expect(sources).not.toContain("/contact");
    expect(sources).not.toContain("/terms");
    expect(sources).not.toContain("/privacy");
    expect(sources).not.toContain("/cookies");
    expect(isMarketplaceOwnLegalPath("/contact")).toBe(true);
    expect(isMarketplaceOwnLegalPath("/es-ES/contact")).toBe(false);
  });

  it("does not attach rules to tenant hosts", () => {
    expect(LEGACY_LANDING_HOSTS.map((entry) => entry.host)).not.toContain(
      "benwerhq.benwer.es",
    );
    expect(
      legacyLandingRedirects().some((rule) =>
        rule.has.some((entry) => entry.value.endsWith(".benwer.es") &&
          entry.value !== "cars.benwer.es" &&
          entry.value !== "staging.cars.benwer.es"),
      ),
    ).toBe(false);
  });
});

describe("legacyLandingRewrites", () => {
  it("proxies email assets to the landing origin without redirecting", () => {
    expect(
      rulesForHost(legacyLandingRewrites(), "cars.benwer.es"),
    ).toEqual([
      {
        source: "/email/:path*",
        destination: "https://benwer.es/email/:path*",
        has: [{ type: "host", value: "cars.benwer.es" }],
      },
      {
        source: "/email-logo.png",
        destination: "https://benwer.es/email-logo.png",
        has: [{ type: "host", value: "cars.benwer.es" }],
      },
      {
        source: "/logo-dark.png",
        destination: "https://benwer.es/logo-dark.png",
        has: [{ type: "host", value: "cars.benwer.es" }],
      },
    ]);
    expect(
      rulesForHost(legacyLandingRewrites(), "staging.cars.benwer.es").map(
        (rule) => rule.destination,
      ),
    ).toEqual([
      "https://staging.benwer.es/email/:path*",
      "https://staging.benwer.es/email-logo.png",
      "https://staging.benwer.es/logo-dark.png",
    ]);
  });
});
