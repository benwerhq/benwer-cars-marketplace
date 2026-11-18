type HostMatch = { type: "host"; value: string };

export interface HostScopedRedirect {
  source: string;
  destination: string;
  statusCode: 308;
  has: HostMatch[];
}

export interface HostScopedRewrite {
  source: string;
  destination: string;
  has: HostMatch[];
}

export interface LegacyLandingHost {
  host: string;
  landingOrigin: string;
  adminOrigin: string;
}

export const LEGACY_LANDING_HOSTS: readonly LegacyLandingHost[] = [
  {
    host: "cars.benwer.es",
    landingOrigin: "https://benwer.es",
    adminOrigin: "https://cars-admin.benwer.es",
  },
  {
    host: "staging.cars.benwer.es",
    landingOrigin: "https://staging.benwer.es",
    adminOrigin: "https://staging.cars-admin.benwer.es",
  },
];

const LANDING_LOCALE = "es-ES|en-GB|pt-PT|es|en|pt";
const ADMIN_PATHS = "login|signup|checkout|onboarding|invite";

const MARKETPLACE_OWN_PATHS = [
  "/contact",
  "/terms",
  "/privacy",
  "/cookies",
] as const;

function hostHas(host: string): HostMatch[] {
  return [{ type: "host", value: host }];
}

function redirectsForHost(target: LegacyLandingHost): HostScopedRedirect[] {
  const has = hostHas(target.host);
  return [
    {
      source: "/investors.html",
      destination: `${target.landingOrigin}/investors.html`,
      statusCode: 308,
      has,
    },
    {
      source: "/investors/:path*",
      destination: `${target.landingOrigin}/investors/:path*`,
      statusCode: 308,
      has,
    },
    {
      source: `/:locale(${LANDING_LOCALE})`,
      destination: `${target.landingOrigin}/:locale`,
      statusCode: 308,
      has,
    },
    {
      source: `/:locale(${LANDING_LOCALE})/:path*`,
      destination: `${target.landingOrigin}/:locale/:path*`,
      statusCode: 308,
      has,
    },
    {
      source: `/:path(${ADMIN_PATHS})`,
      destination: `${target.adminOrigin}/:path`,
      statusCode: 308,
      has,
    },
  ];
}

function rewritesForHost(target: LegacyLandingHost): HostScopedRewrite[] {
  const has = hostHas(target.host);
  return [
    {
      source: "/email/:path*",
      destination: `${target.landingOrigin}/email/:path*`,
      has,
    },
    {
      source: "/email-logo.png",
      destination: `${target.landingOrigin}/email-logo.png`,
      has,
    },
    {
      source: "/logo-dark.png",
      destination: `${target.landingOrigin}/logo-dark.png`,
      has,
    },
  ];
}

export function legacyLandingRedirects(): HostScopedRedirect[] {
  return LEGACY_LANDING_HOSTS.flatMap(redirectsForHost);
}

export function legacyLandingRewrites(): HostScopedRewrite[] {
  return LEGACY_LANDING_HOSTS.flatMap(rewritesForHost);
}

export function isMarketplaceOwnLegalPath(pathname: string): boolean {
  return (MARKETPLACE_OWN_PATHS as readonly string[]).includes(pathname);
}
