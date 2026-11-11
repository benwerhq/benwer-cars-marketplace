export const SAME_ORIGIN_API_PREFIX = "/api";

export function collapseDuplicateV1Path(url: string): string {
  return url.replace(/\/v1\/(?:v1\/)+/gi, "/v1/");
}

export function normalizeApiBaseUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, "");
  while (/\/v1$/i.test(url)) {
    url = url.replace(/\/v1$/i, "");
  }
  return url;
}

export function joinApiUrl(base: string, path: string): string {
  const origin = normalizeApiBaseUrl(base);
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return collapseDuplicateV1Path(`${origin}${suffix}`);
}

export function isSameOriginApiBase(base: string, pageOrigin: string): boolean {
  if (!base) {
    return false;
  }

  if (base.startsWith("/")) {
    return true;
  }

  try {
    return new URL(base, pageOrigin).origin === new URL(pageOrigin).origin;
  } catch {
    return false;
  }
}

export function resolveBrowserApiBaseUrl(
  configured: string,
  publicEnv: "local" | "staging" | "production",
  pageOrigin = "",
): string {
  const base = normalizeApiBaseUrl(configured);
  if (!base) {
    return publicEnv === "local" ? "" : SAME_ORIGIN_API_PREFIX;
  }

  if (
    publicEnv !== "local" &&
    pageOrigin &&
    !isSameOriginApiBase(base, pageOrigin)
  ) {
    return SAME_ORIGIN_API_PREFIX;
  }

  return base;
}

export const MOCK_CATALOGUE_OPT_IN_ENV = "BENWER_ALLOW_MOCK_CATALOGUE";

export function shouldUseMockFallback(
  publicEnv: "local" | "staging" | "production",
  nodeEnv = process.env.NODE_ENV,
  mockCatalogueOptIn = process.env[MOCK_CATALOGUE_OPT_IN_ENV],
): boolean {
  if (nodeEnv === "production") {
    return false;
  }

  return mockCatalogueOptIn === "1" && publicEnv === "local";
}

export function assertMockCatalogueAllowed(
  publicEnv: "local" | "staging" | "production",
  nodeEnv = process.env.NODE_ENV,
  mockCatalogueOptIn = process.env[MOCK_CATALOGUE_OPT_IN_ENV],
): void {
  if (!shouldUseMockFallback(publicEnv, nodeEnv, mockCatalogueOptIn)) {
    throw new Error("Mock catalogue is disabled");
  }
}

export function isAllowedPublicApiProxyPath(
  method: string,
  path: string,
): boolean {
  const normalized = path.replace(/^\/+/, "");
  const verb = method.toUpperCase();

  if (verb === "GET" && /^v1\/public(?:\/|$)/.test(normalized)) {
    return true;
  }

  if (verb === "POST" && normalized === "v1/contact") {
    return true;
  }

  if (
    verb === "POST" &&
    /^v1\/public\/companies\/[^/]+\/reservations$/.test(normalized)
  ) {
    return true;
  }

  if (
    verb === "POST" &&
    /^v1\/public\/reservations\/[^/]+\/(withdraw|payments|cancel)$/.test(
      normalized,
    )
  ) {
    return true;
  }

  return false;
}

export function isUnreachableError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return (
      message.includes("fetch") ||
      message.includes("network") ||
      message.includes("failed to")
    );
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("fetch failed") ||
      message.includes("network") ||
      message.includes("econnrefused") ||
      message.includes("enotfound") ||
      message.includes("etimedout") ||
      message.includes("aborted")
    );
  }

  return false;
}
