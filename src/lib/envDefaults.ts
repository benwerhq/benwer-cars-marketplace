export type PublicEnvironment = "local" | "staging" | "production";

export interface PublicDefaultUrls {
  admin: string;
  marketing: string;
}

const DEFAULT_URLS: Record<PublicEnvironment, PublicDefaultUrls> = {
  production: {
    admin: "https://cars-admin.benwer.es",
    marketing: "https://cars.benwer.es",
  },
  staging: {
    admin: "https://staging.cars-admin.benwer.es",
    marketing: "https://staging.cars.benwer.es",
  },
  local: {
    admin: "http://localhost:3001",
    marketing: "http://localhost:3000",
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
