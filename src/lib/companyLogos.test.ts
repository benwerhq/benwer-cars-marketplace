import { describe, expect, it } from "vitest";
import {
  brandHeaderTone,
  companyLogoPair,
  logoSrcForBackground,
} from "./companyLogos";

describe("companyLogoPair", () => {
  it("prefers wide logos and falls back through light and dark variants", () => {
    expect(
      companyLogoPair({
        logoUrl: "/logo.png",
        logoLightUrl: "/logo-white.png",
        logoDarkUrl: "/logo-dark.png",
        wideLightLogoUrl: "/wide-light.png",
        wideDarkLogoUrl: "/wide-dark.png",
      }),
    ).toEqual({
      logoUrl: "/wide-light.png",
      logoDarkUrl: "/wide-dark.png",
    });

    expect(
      companyLogoPair({
        logoUrl: "/logo.png",
        logoLightUrl: "/logo-white.png",
        logoDarkUrl: null,
      }),
    ).toEqual({
      logoUrl: "/logo.png",
      logoDarkUrl: "/logo-white.png",
    });
  });
});

describe("logoSrcForBackground", () => {
  const branding = {
    logoUrl: "/black.png",
    logoLightUrl: "/white.png",
    logoDarkUrl: "/dark.png",
    wideLightLogoUrl: "/wide-black.png",
    wideDarkLogoUrl: "/wide-white.png",
  };

  it("uses the black-text logo on a light header and falls back", () => {
    expect(logoSrcForBackground(branding, "light")).toBe("/wide-black.png");
    expect(
      logoSrcForBackground({ logoUrl: null, logoLightUrl: "/white.png" }, "light"),
    ).toBe("/white.png");
  });

  it("uses the white-text logo on a dark header and falls back", () => {
    expect(logoSrcForBackground(branding, "dark")).toBe("/wide-white.png");
    expect(
      logoSrcForBackground({ logoUrl: "/black.png", logoLightUrl: null }, "dark"),
    ).toBe("/black.png");
  });
});

describe("brandHeaderTone", () => {
  it("treats dark brand colours as dark headers", () => {
    expect(brandHeaderTone("#0e7490")).toBe("dark");
    expect(brandHeaderTone("#111111")).toBe("dark");
  });

  it("treats light brand colours as light headers", () => {
    expect(brandHeaderTone("#e8a52c")).toBe("light");
    expect(brandHeaderTone("#f8fafc")).toBe("light");
  });
});
