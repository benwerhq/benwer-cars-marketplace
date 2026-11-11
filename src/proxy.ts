import { NextRequest, NextResponse } from "next/server";
import {
  UNKNOWN_HOST_PATH,
  rewriteCustomDomainPath,
} from "@/lib/customDomain";
import { lookupPublicHost } from "@/lib/hostLookup";
import {
  isPlatformHost,
  normalizeRequestHost,
  resolvePlatformTenantSlug,
} from "@/lib/platformHost";
import {
  isTenantHostPublicPath,
  isTenantInternalPath,
  toTenantInternalPath,
} from "@/lib/tenantRouting";

export async function proxy(request: NextRequest) {
  const hostname = normalizeRequestHost(request.headers.get("host") ?? "");
  const marketplaceDomain =
    process.env.NEXT_PUBLIC_MARKETPLACE_DOMAIN ?? "benwer.es";
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    requestHeaders.delete("origin");
  }

  let companySlug = resolvePlatformTenantSlug(hostname, marketplaceDomain);
  let customDomain = false;

  if (!companySlug && !isPlatformHost(hostname, marketplaceDomain)) {
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

  if (companySlug) {
    requestHeaders.set("x-company-slug", companySlug);
  }

  if (customDomain && companySlug) {
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
      return response;
    }
  }

  if (!companySlug && isTenantInternalPath(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (companySlug && !customDomain && isTenantHostPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = toTenantInternalPath(pathname);
    const response = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
    response.headers.set("x-company-slug", companySlug);
    return response;
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
