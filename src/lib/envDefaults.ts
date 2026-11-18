export type PublicEnvironment = "local" | "staging" | "production";

export interface PublicDefaultUrls {
  admin: string;
  marketing: string;
  app: string;
  marketplaceDomain: string;
}

const DEFAULT_URLS: Record<PublicEnvironment, PublicDefaultUrls> = {
  production: {
    admin: "https://cars-admin.benwer.es",
    marketing: "https://benwer.es",
    app: "https://cars.benwer.es",
    marketplaceDomain: "benwer.es",
  },
  staging: {
    admin: "https://staging.cars-admin.benwer.es",
    marketing: "https://staging.benwer.es",
    app: "https://staging.cars.benwer.es",
    marketplaceDomain: "staging.benwer.es",
  },
  local: {
    admin: "http://localhost:3001",
    marketing: "http://localhost:3000",
    app: "http://localhost:3002",
    marketplaceDomain: "benwer.es",
  },
};

export function resolvePublicEnvironment(
  value: string | undefined,
  nodeEnv: string | undefined,
): PublicEnvironment {
  if (value === "local" || value === "staging" || value === "production") {
    return value;
  }
  return nodeEnv === "production" ? "production" : "local";
}

/**
 * Fallback admin/marketing origins for the current build. A staging or local
 * build must never fall back to a production host.
 */
export function defaultPublicUrls(
  environment: PublicEnvironment = resolvePublicEnvironment(
    process.env.NEXT_PUBLIC_ENV,
    process.env.NODE_ENV,
  ),
): PublicDefaultUrls {
  return DEFAULT_URLS[environment];
}
