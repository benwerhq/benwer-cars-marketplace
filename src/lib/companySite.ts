import { SearchParams } from "@/enums";
import { env } from "@/env";
import {
  companySubdomainOrigin,
  hostFromAppUrl,
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
  const appHost =
    hostFromAppUrl(env.NEXT_PUBLIC_APP_URL) ??
    new URL(env.NEXT_PUBLIC_APP_URL).hostname;
  return usesCompanySubdomains(appHost, env.NEXT_PUBLIC_MARKETPLACE_DOMAIN);
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
