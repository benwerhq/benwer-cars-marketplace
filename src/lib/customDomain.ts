import { TENANT_INTERNAL_PREFIX } from "@/lib/tenantRouting";

export const UNKNOWN_HOST_PATH = "/host-unknown";

const PASSTHROUGH = "passthrough";
const UNKNOWN = "unknown";

export type CustomDomainRewrite = typeof PASSTHROUGH | typeof UNKNOWN | string;

const ALLOWED_PREFIXES = [
  "/api",
  "/privacy",
  "/terms",
  "/cookies",
  "/host-unknown",
];

export function rewriteCustomDomainPath(
  pathname: string,
  slug: string,
): CustomDomainRewrite {
  const path = pathname === "" ? "/" : pathname;

  if (ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return PASSTHROUGH;
  }

  const siteRoot = `/s/${encodeURIComponent(slug)}`;

  if (path === siteRoot || path.startsWith(`${siteRoot}/`)) {
    return PASSTHROUGH;
  }

  if (path === TENANT_INTERNAL_PREFIX || path.startsWith(`${TENANT_INTERNAL_PREFIX}/`)) {
    return UNKNOWN;
  }

  if (path === "/s" || path.startsWith("/s/")) {
    return UNKNOWN;
  }

  if (path === "/") {
    return siteRoot;
  }

  if (
    path === "/search" ||
    path.startsWith("/search/") ||
    path === "/cars" ||
    path.startsWith("/cars/") ||
    path === "/book" ||
    path.startsWith("/book/") ||
    path === "/booking" ||
    path.startsWith("/booking/")
  ) {
    return `${siteRoot}${path}`;
  }

  return UNKNOWN;
}

export function customDomainPublicPath(sitePath: string, slug: string): string {
  const prefix = `/s/${slug}`;
  if (sitePath === prefix) {
    return "/";
  }

  if (sitePath.startsWith(`${prefix}/`)) {
    return sitePath.slice(prefix.length) || "/";
  }

  return sitePath;
}
