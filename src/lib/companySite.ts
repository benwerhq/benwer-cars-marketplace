import { SearchParams } from "@/enums";
import { env } from "@/env";
import {
  companySubdomainOrigin,
  hostFromAppUrl,
  isLoopbackHost,
  usesCompanySubdomains,
} from "@/lib/platformHost";

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function buildCompanySiteOrigin(slug: string): string {
  return companySubdomainOrigin(
    slug,
    env.NEXT_PUBLIC_MARKETPLACE_DOMAIN,
    env.NEXT_PUBLIC_APP_URL,
  );
}

export function shouldLinkCompanySubdomain(): boolean {
  const domain = env.NEXT_PUBLIC_MARKETPLACE_DOMAIN.trim();
  if (!domain) {
    return false;
  }

  const appHost =
    hostFromAppUrl(env.NEXT_PUBLIC_APP_URL) ??
    new URL(env.NEXT_PUBLIC_APP_URL).hostname;
  if (usesCompanySubdomains(appHost, domain)) {
    return true;
  }

  return !isLoopbackHost(appHost);
}

/**
 * The company's own website URL when links may use it. A staging build only
 * follows website URLs on the staging site domain: custom domains are wired
 * to production, so following them from staging leaves the environment.
 */
export function usableWebsiteUrl(value?: string | null): string | null {
  const raw = value?.trim();
  if (!raw || !isHttpUrl(raw)) {
    return null;
  }

  if (env.NEXT_PUBLIC_ENV !== "staging") {
    return raw;
  }

  try {
    const host = new URL(raw).hostname.toLowerCase();
    const domain = env.NEXT_PUBLIC_MARKETPLACE_DOMAIN.trim().toLowerCase();
    return domain && (host === domain || host.endsWith(`.${domain}`)) ? raw : null;
  } catch {
    return null;
  }
}

export function buildCompanySiteHref(input: {
  slug: string;
  websiteUrl?: string | null;
  path?: string;
  from?: string;
  to?: string;
  params?: Record<string, string | undefined>;
}): string {
  const entries = Object.entries({
    [SearchParams.FROM]: input.from,
    [SearchParams.TO]: input.to,
    ...(input.params ?? {}),
  }).filter((entry): entry is [string, string] => Boolean(entry[1]));
  const query = new URLSearchParams(entries).toString();
  const path = input.path && input.path !== "/" ? input.path : "";

  const websiteUrl = usableWebsiteUrl(input.websiteUrl);
  if (websiteUrl) {
    const url = new URL(websiteUrl);
    if (path) {
      url.pathname = `${url.pathname.replace(/\/$/, "")}${path}`;
    }
    for (const [key, value] of entries) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }


  if (shouldLinkCompanySubdomain()) {
    const origin = buildCompanySiteOrigin(input.slug);
    const publicPath = path || "/";
    return query ? `${origin}${publicPath}?${query}` : `${origin}${publicPath}`;
  }

  const origin = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const sitePath = `/s/${encodeURIComponent(input.slug)}${path}`;
  return query ? `${origin}${sitePath}?${query}` : `${origin}${sitePath}`;
}

export function buildCompanyCarHref(input: {
  slug: string;
  vehicleId: string;
  websiteUrl?: string | null;
  from?: string;
  to?: string;
  params?: Record<string, string | undefined>;
}): string {
  return buildCompanySiteHref({
    slug: input.slug,
    websiteUrl: input.websiteUrl,
    path: `/cars/${encodeURIComponent(input.vehicleId)}`,
    from: input.from,
    to: input.to,
    params: input.params,
  });
}
