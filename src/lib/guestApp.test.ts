import { afterEach, describe, expect, it, vi } from "vitest";
import {
  appStoreIdFromUrl,
  buildAppleAppSiteAssociation,
  buildAssetLinks,
  guestAppCompanyUrl,
  guestAppId,
  guestAppSmartBanner,
  isWellKnownPath,
  parseFingerprints,
  parseGuestAppStoreLinks,
  servesGuestAppLinks,
} from "./guestApp";

const FINGERPRINT = Array.from({ length: 32 }, () => "AB").join(":");

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("guestAppId", () => {
  it("uses the staging id everywhere except production", () => {
    expect(guestAppId("production")).toBe("com.benwer.cars.guest");
    expect(guestAppId("staging")).toBe("com.benwer.cars.guest.staging");
    expect(guestAppId("local")).toBe("com.benwer.cars.guest.staging");
  });

  it("accepts a valid override and rejects a malformed one", () => {
    expect(guestAppId("staging", "com.example.app")).toBe("com.example.app");
    expect(guestAppId("staging", "not an id")).toBeNull();
  });
});

describe("buildAppleAppSiteAssociation", () => {
  it("returns null without a valid team id", () => {
    expect(buildAppleAppSiteAssociation({ teamId: undefined, appId: "com.x.y" })).toBeNull();
    expect(buildAppleAppSiteAssociation({ teamId: "TEAMID", appId: "com.x.y" })).toBeNull();
  });

  it("lists the app id and the universal link paths", () => {
    const association = buildAppleAppSiteAssociation({
      teamId: "abcde12345",
      appId: "com.benwer.cars.guest.staging",
    });
    expect(association?.applinks.details[0]?.appIDs).toEqual([
      "ABCDE12345.com.benwer.cars.guest.staging",
    ]);
    expect(association?.applinks.details[0]?.components).toEqual([
      { "/": "/booking/*" },
      { "/": "/companies/*" },
      { "/": "/trips*" },
      { "/": "/app*" },
    ]);
  });
});

describe("buildAssetLinks", () => {
  it("returns null without fingerprints", () => {
    expect(buildAssetLinks({ appId: "com.x.y", fingerprints: [] })).toBeNull();
  });

  it("declares the package and its fingerprints", () => {
    expect(buildAssetLinks({ appId: "com.x.y", fingerprints: [FINGERPRINT] })).toEqual([
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.x.y",
          sha256_cert_fingerprints: [FINGERPRINT],
        },
      },
    ]);
  });
});

describe("parseFingerprints", () => {
  it("normalises, dedupes and rejects the whole list on a bad entry", () => {
    expect(parseFingerprints(`${FINGERPRINT.toLowerCase()}, ${FINGERPRINT}`)).toEqual([FINGERPRINT]);
    expect(parseFingerprints(`${FINGERPRINT},placeholder`)).toEqual([]);
    expect(parseFingerprints(undefined)).toEqual([]);
  });
});

describe("store links", () => {
  it("keeps only https store links", () => {
    expect(
      parseGuestAppStoreLinks({ iosUrl: "http://apps.apple.com/x", androidUrl: " https://play.google.com/x " }),
    ).toEqual({ iosUrl: "", androidUrl: "https://play.google.com/x" });
  });

  it("reads the App Store id for the Smart App Banner", () => {
    const iosUrl = "https://apps.apple.com/es/app/benwer-cars/id1234567890?l=en";
    expect(appStoreIdFromUrl(iosUrl)).toBe("1234567890");
    expect(guestAppSmartBanner({ iosUrl, androidUrl: "" })).toEqual({ appId: "1234567890" });
    expect(guestAppSmartBanner({ iosUrl: "", androidUrl: "https://play.google.com/x" })).toBeNull();
  });

  it("builds the company link on the marketplace host", () => {
    expect(guestAppCompanyUrl("acme cars", "https://marketplace.example/")).toBe(
      "https://marketplace.example/companies/acme%20cars",
    );
  });
});

describe("hosts and paths", () => {
  it("matches only /.well-known paths", () => {
    expect(isWellKnownPath("/.well-known/assetlinks.json")).toBe(true);
    expect(isWellKnownPath("/.well-known")).toBe(true);
    expect(isWellKnownPath("/.well-knownx")).toBe(false);
    expect(isWellKnownPath("/companies/acme")).toBe(false);
  });

  it("serves association files on the marketplace host only", () => {
    vi.stubEnv("NEXT_PUBLIC_MARKETPLACE_DOMAIN", "staging.benwer.es");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://staging.cars-marketplace.benwer.es");
    expect(servesGuestAppLinks("staging.cars-marketplace.benwer.es")).toBe(true);
    expect(servesGuestAppLinks("acme.staging.benwer.es")).toBe(false);
    expect(servesGuestAppLinks("www.acme-cars.example")).toBe(false);
  });
});
