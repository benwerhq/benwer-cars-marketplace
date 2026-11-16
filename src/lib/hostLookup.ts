import { joinApiUrl, normalizeApiBaseUrl } from "@/lib/publicApiProxy";

export const HOST_LOOKUP_TTL_MS = 60_000;
const LOOKUP_TIMEOUT_MS = 2500;

export interface PublicHost {
  host: string;
  slug: string;
  canonicalUrl: string;
}

interface CacheEntry {
  expiresAt: number;
  value: PublicHost | null;
}

const cache = new Map<string, CacheEntry>();

export function resetHostLookupCache(): void {
  cache.clear();
}

export function publicApiOriginFromEnv(
  apiOrigin = process.env.API_ORIGIN,
  publicApiUrl = process.env.NEXT_PUBLIC_API_URL,
): string {
  return normalizeApiBaseUrl(apiOrigin ?? publicApiUrl ?? "");
}

function readHostPayload(payload: unknown, fallbackHost: string): PublicHost | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const row = payload as Record<string, unknown>;
  const slug = typeof row.slug === "string" ? row.slug.trim() : "";
  if (!slug) {
    return null;
  }

  const host =
    typeof row.host === "string" && row.host.trim()
      ? row.host.trim().toLowerCase()
      : fallbackHost;
  const canonicalUrl =
    typeof row.canonicalUrl === "string" ? row.canonicalUrl.trim() : "";

  return { host, slug, canonicalUrl };
}

export async function lookupPublicHost(
  host: string,
  options?: {
    now?: number;
    fetchImpl?: typeof fetch;
    apiOrigin?: string;
  },
): Promise<PublicHost | null> {
  const now = options?.now ?? Date.now();
  const cached = cache.get(host);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const origin = options?.apiOrigin ?? publicApiOriginFromEnv();
  if (!origin || !host) {
    return null;
  }

  const url = new URL(joinApiUrl(origin, "/v1/public/hosts"));
  url.searchParams.set("host", host);

  try {
    const response = await (options?.fetchImpl ?? fetch)(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    });

    if (response.status === 404) {
      cache.set(host, { value: null, expiresAt: now + HOST_LOOKUP_TTL_MS });
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const value = readHostPayload(await response.json(), host);
    cache.set(host, { value, expiresAt: now + HOST_LOOKUP_TTL_MS });
    return value;
  } catch {
    return null;
  }
}
