import { NextRequest, NextResponse } from "next/server";
import {
  UNKNOWN_HOST_PATH,
  customDomainPublicPath,
  rewriteCustomDomainPath,
} from "@/lib/customDomain";
import { isWellKnownPath } from "@/lib/guestApp";
import { lookupPublicHost } from "@/lib/hostLookup";
import {
  companySubdomainOrigin,
  isMarketplaceFrontDoor,
  isPlatformHost,
  normalizeRequestHost,
  parseSiteFallbackPath,
  platformExtraHosts,
  resolvePlatformTenantSlug,
  usesCompanySubdomains,
} from "@/lib/platformHost";
import { isTenantInternalPath } from "@/lib/tenantRouting";

function hostOptions() {
  return {
    extraHosts: platformExtraHosts({
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      platformHosts: process.env.NEXT_PUBLIC_PLATFORM_HOSTS,
    }),
  };
}

export async function proxy(request: NextRequest) {
  if (isWellKnownPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const hostname = normalizeRequestHost(request.headers.get("host") ?? "");
  const marketplaceDomain =
    process.env.NEXT_PUBLIC_MARKETPLACE_DOMAIN ?? "benwer.es";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";
  const extra = hostOptions();
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    requestHeaders.delete("origin");
  }

  let companySlug = resolvePlatformTenantSlug(
    hostname,
    marketplaceDomain,
    extra,
  );
  let customDomain = false;

  if (!companySlug && !isPlatformHost(hostname, marketplaceDomain, extra)) {
    const resolved = await lookupPublicHost(hostname);
    if (!resolved) {
      return unknownHostResponse(request, pathname);
    }

    companySlug = resolved.slug;
    customDomain = true;
    requestHeaders.set("x-site-host", resolved.host);
    if (resolved.canonicalUrl) {
      requestHeaders.set("x-canonical-url", resolved.canonicalUrl);
    }
  }

  if (
    !companySlug &&
    isMarketplaceFrontDoor(hostname, marketplaceDomain, extra) &&
    usesCompanySubdomains(hostname, marketplaceDomain)
  ) {
    const parsed = parseSiteFallbackPath(pathname);
    if (parsed) {
      const destination = new URL(
        `${companySubdomainOrigin(parsed.slug, marketplaceDomain, appUrl)}${parsed.rest}`,
      );
      destination.search = request.nextUrl.search;
      return NextResponse.redirect(destination, 308);
    }
  }

  if (companySlug) {
    requestHeaders.set("x-company-slug", companySlug);
  }

  if (companySlug) {
    const siteRoot = `/s/${encodeURIComponent(companySlug)}`;
    if (pathname === siteRoot || pathname.startsWith(`${siteRoot}/`)) {
      const url = request.nextUrl.clone();
      url.pathname = customDomainPublicPath(pathname, companySlug);
      return NextResponse.redirect(url, 308);
    }

    const destination = rewriteCustomDomainPath(pathname, companySlug);
    if (destination === "unknown") {
      return unknownHostResponse(request, pathname);
    }

    if (destination !== "passthrough") {
      const url = request.nextUrl.clone();
      url.pathname = destination;
      const response = NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
      });
      response.headers.set("x-company-slug", companySlug);
      if (customDomain) {
        response.headers.set("x-site-host", hostname);
      }
      return response;
    }
  }

  if (!companySlug && isTenantInternalPath(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  if (companySlug) {
    response.headers.set("x-company-slug", companySlug);
  }
  return response;
}

function unknownHostResponse(request: NextRequest, pathname: string) {
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return NextResponse.json({ status: 404, code: "unknown" }, { status: 404 });
  }

  const url = request.nextUrl.clone();
  url.pathname = UNKNOWN_HOST_PATH;
  const response = NextResponse.rewrite(url);
  response.headers.set("x-robots-tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
