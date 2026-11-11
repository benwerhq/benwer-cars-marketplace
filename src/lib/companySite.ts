import { SearchParams } from "@/enums";
import { env } from "@/env";

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function buildCompanySiteOrigin(slug: string): string {
  const domain = env.NEXT_PUBLIC_MARKETPLACE_DOMAIN;
  const app = new URL(env.NEXT_PUBLIC_APP_URL);
  const isLocalDomain = domain === "localhost" || domain.endsWith(".localhost");
  const protocol = isLocalDomain ? app.protocol.replace(":", "") : "https";
  const port = isLocalDomain && app.port ? `:${app.port}` : "";
  return `${protocol}://${slug}.${domain}${port}`;
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
  const origin = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const sitePath = `/s/${encodeURIComponent(input.slug)}${path}`;
  return query ? `${origin}${sitePath}?${query}` : `${origin}${sitePath}`;
}
