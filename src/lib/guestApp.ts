import { GuestAppIds, GuestAppLinkPaths } from "@/enums";
import { resolvePublicEnvironment, type PublicEnvironment } from "./envDefaults";
import {
  isMarketplaceFrontDoor,
  normalizeRequestHost,
  platformExtraHosts,
} from "./platformHost";

export interface GuestAppStoreLinks {
  iosUrl: string;
  androidUrl: string;
}

export interface AppleAppSiteAssociation {
  applinks: {
    details: {
      appIDs: string[];
      components: { "/": string }[];
    }[];
  };
}

export interface AssetLinkStatement {
  relation: string[];
  target: {
    namespace: "android_app";
    package_name: string;
    sha256_cert_fingerprints: string[];
  };
}

const WELL_KNOWN_PREFIX = "/.well-known";
const APPLE_TEAM_ID = /^[A-Z0-9]{10}$/;
const APP_ID = /^[a-zA-Z][\w-]*(\.[a-zA-Z][\w-]*)+$/;
const SHA256_FINGERPRINT = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;
const APP_STORE_ID = /\/id(\d{6,})(?:[/?#]|$)/;

function httpsUrl(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return "";
  }
  try {
    return new URL(trimmed).protocol === "https:" ? trimmed : "";
  } catch {
    return "";
  }
}

export function parseGuestAppStoreLinks(input: {
  iosUrl?: string;
  androidUrl?: string;
}): GuestAppStoreLinks {
  return { iosUrl: httpsUrl(input.iosUrl), androidUrl: httpsUrl(input.androidUrl) };
}

export function guestAppStoreLinks(): GuestAppStoreLinks {
  return parseGuestAppStoreLinks({
    iosUrl: process.env.NEXT_PUBLIC_GUEST_APP_IOS_URL,
    androidUrl: process.env.NEXT_PUBLIC_GUEST_APP_ANDROID_URL,
  });
}

export function hasGuestAppStoreLinks(links: GuestAppStoreLinks): boolean {
  return Boolean(links.iosUrl || links.androidUrl);
}

export function appStoreIdFromUrl(iosUrl: string): string | null {
  return iosUrl.match(APP_STORE_ID)?.[1] ?? null;
}

export function guestAppId(
  environment: PublicEnvironment,
  override?: string,
): string | null {
  const custom = override?.trim();
  if (custom) {
    return APP_ID.test(custom) ? custom : null;
  }
  return environment === "production" ? GuestAppIds.PRODUCTION : GuestAppIds.STAGING;
}

export function parseFingerprints(value: string | undefined): string[] {
  const fingerprints = (value ?? "")
    .split(",")
    .map((entry) => entry.trim().toUpperCase())
    .filter(Boolean);
  if (fingerprints.length === 0 || !fingerprints.every((entry) => SHA256_FINGERPRINT.test(entry))) {
    return [];
  }
  return [...new Set(fingerprints)];
}

export function buildAppleAppSiteAssociation(input: {
  teamId: string | undefined;
  appId: string | null;
}): AppleAppSiteAssociation | null {
  const teamId = input.teamId?.trim().toUpperCase() ?? "";
  if (!APPLE_TEAM_ID.test(teamId) || !input.appId) {
    return null;
  }
  return {
    applinks: {
      details: [
        {
          appIDs: [`${teamId}.${input.appId}`],
          components: Object.values(GuestAppLinkPaths).map((path) => ({ "/": path })),
        },
      ],
    },
  };
}

export function buildAssetLinks(input: {
  appId: string | null;
  fingerprints: string[];
}): AssetLinkStatement[] | null {
  if (!input.appId || input.fingerprints.length === 0) {
    return null;
  }
  return [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: input.appId,
        sha256_cert_fingerprints: input.fingerprints,
      },
    },
  ];
}

function currentEnvironment(): PublicEnvironment {
  return resolvePublicEnvironment(process.env.NEXT_PUBLIC_ENV, process.env.NODE_ENV);
}

export function appleAppSiteAssociationFromEnv(): AppleAppSiteAssociation | null {
  return buildAppleAppSiteAssociation({
    teamId: process.env.GUEST_APP_APPLE_TEAM_ID,
    appId: guestAppId(currentEnvironment(), process.env.GUEST_APP_IOS_BUNDLE_ID),
  });
}

export function assetLinksFromEnv(): AssetLinkStatement[] | null {
  return buildAssetLinks({
    appId: guestAppId(currentEnvironment(), process.env.GUEST_APP_ANDROID_PACKAGE),
    fingerprints: parseFingerprints(process.env.GUEST_APP_ANDROID_SHA256_FINGERPRINTS),
  });
}

export function servesGuestAppLinks(hostHeader: string | null): boolean {
  return isMarketplaceFrontDoor(
    normalizeRequestHost(hostHeader ?? ""),
    process.env.NEXT_PUBLIC_MARKETPLACE_DOMAIN ?? "benwer.es",
    {
      extraHosts: platformExtraHosts({
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
        platformHosts: process.env.NEXT_PUBLIC_PLATFORM_HOSTS,
      }),
    },
  );
}

export function isWellKnownPath(pathname: string): boolean {
  return pathname === WELL_KNOWN_PREFIX || pathname.startsWith(`${WELL_KNOWN_PREFIX}/`);
}

export function guestAppCompanyUrl(
  slug: string,
  appUrl: string = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002",
): string {
  return `${appUrl.replace(/\/$/, "")}/companies/${encodeURIComponent(slug)}`;
}

export function guestAppSmartBanner(
  links: GuestAppStoreLinks = guestAppStoreLinks(),
): { appId: string } | null {
  const appId = appStoreIdFromUrl(links.iosUrl);
  return appId ? { appId } : null;
}
