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

export function buildCompanySiteHref(input: {
  slug: string;
  websiteUrl?: string | null;
  path?: string;
  from?: string;
  to?: string;
}): string {
  const params = new URLSearchParams();
  if (input.from) {
    params.set(SearchParams.FROM, input.from);
  }
  if (input.to) {
    params.set(SearchParams.TO, input.to);
  }
  const query = params.toString();

  const websiteUrl = input.websiteUrl?.trim();
  if (websiteUrl && isHttpUrl(websiteUrl)) {
    const url = new URL(websiteUrl);
    if (input.from) {
      url.searchParams.set(SearchParams.FROM, input.from);
    }
    if (input.to) {
      url.searchParams.set(SearchParams.TO, input.to);
    }
    return url.toString();
  }

  const path = input.path && input.path !== "/" ? input.path : "";

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
}): string {
  return buildCompanySiteHref({
    slug: input.slug,
    websiteUrl: input.websiteUrl,
    path: `/cars/${encodeURIComponent(input.vehicleId)}`,
    from: input.from,
    to: input.to,
  });
}
