import { describe, expect, it } from "vitest";
import {
  customDomainPublicPath,
  rewriteCustomDomainPath,
} from "./customDomain";

describe("rewriteCustomDomainPath", () => {
  it("rewrites public tenant paths onto the resolved /s/{slug} site", () => {
    expect(rewriteCustomDomainPath("/", "acme")).toBe("/s/acme");
    expect(rewriteCustomDomainPath("/search", "acme")).toBe("/s/acme/search");
    expect(rewriteCustomDomainPath("/cars/v1", "acme")).toBe("/s/acme/cars/v1");
    expect(rewriteCustomDomainPath("/book", "acme")).toBe("/s/acme/book");
    expect(rewriteCustomDomainPath("/booking/tok", "acme")).toBe(
      "/s/acme/booking/tok",
    );
    expect(rewriteCustomDomainPath("/owner", "acme")).toBe("/s/acme/owner");
    expect(rewriteCustomDomainPath("/guest/confirm", "acme")).toBe(
      "/s/acme/guest/confirm",
    );
    expect(rewriteCustomDomainPath("/guest/profile", "acme")).toBe(
      "/s/acme/guest/profile",
    );
    expect(rewriteCustomDomainPath("/privacy", "acme")).toBe("/s/acme/privacy");
    expect(rewriteCustomDomainPath("/terms", "acme")).toBe("/s/acme/terms");
    expect(rewriteCustomDomainPath("/cart", "acme")).toBe("/s/acme/cart");
  });

  it("never rewrites onto another tenant slug", () => {
    expect(rewriteCustomDomainPath("/s/other", "acme")).toBe("unknown");
    expect(rewriteCustomDomainPath("/s/other/cars/v1", "acme")).toBe("unknown");
    expect(rewriteCustomDomainPath("/tenant", "acme")).toBe("unknown");
    expect(rewriteCustomDomainPath("/companies", "acme")).toBe("unknown");
  });

  it("passes through public static files such as banner images", () => {
    expect(rewriteCustomDomainPath("/images/banners/site-airport.webp", "acme")).toBe(
      "passthrough",
    );
    expect(rewriteCustomDomainPath("/localstack/bucket/photo.jpg", "acme")).toBe(
      "passthrough",
    );
    expect(rewriteCustomDomainPath("/robots.txt", "acme")).toBe("passthrough");
  });

  it("passes through matching /s/{slug} and the same-origin API", () => {
    expect(rewriteCustomDomainPath("/s/acme", "acme")).toBe("passthrough");
    expect(rewriteCustomDomainPath("/s/acme/book", "acme")).toBe("passthrough");
    expect(rewriteCustomDomainPath("/api/v1/public/hosts", "acme")).toBe(
      "passthrough",
    );
  });
});

describe("customDomainPublicPath", () => {
  it("strips the /s/{slug} prefix for canonical URLs on a custom origin", () => {
    expect(customDomainPublicPath("/s/acme", "acme")).toBe("/");
    expect(customDomainPublicPath("/s/acme/cars/v1", "acme")).toBe("/cars/v1");
  });
});
