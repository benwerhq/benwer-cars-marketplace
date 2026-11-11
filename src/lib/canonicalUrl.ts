import { customDomainPublicPath } from "@/lib/customDomain";
import { absoluteUrl } from "@/lib/seo";

export function siteCanonicalPageUrl(
  canonicalUrl: string | null | undefined,
  sitePath: string,
  slug: string,
): string {
  if (!canonicalUrl) {
    return absoluteUrl(sitePath);
  }

  try {
    const base = new URL(canonicalUrl);
    const prefix = `/s/${slug}`;
    const basePath = base.pathname.replace(/\/$/, "") || "/";

    if (basePath === prefix || basePath.startsWith(`${prefix}/`)) {
      return `${base.origin}${sitePath.startsWith("/") ? sitePath : `/${sitePath}`}`;
    }

    const publicPath = customDomainPublicPath(sitePath, slug);
    if (publicPath === "/") {
      return `${base.origin}/`;
    }

    return `${base.origin}${publicPath}`;
  } catch {
    return absoluteUrl(sitePath);
  }
}

export function platformBookingHref(token: string): string {
  return absoluteUrl(`/booking/${encodeURIComponent(token)}`);
}
