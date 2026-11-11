import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/env";
import {
  isAllowedPublicApiProxyPath,
  normalizeApiBaseUrl,
} from "@/lib/publicApiProxy";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

function upstreamOrigin(): string {
  return normalizeApiBaseUrl(env.API_ORIGIN ?? env.NEXT_PUBLIC_API_URL ?? "");
}

async function proxyPublicApi(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const pathname = path.join("/");

  if (!isAllowedPublicApiProxyPath(request.method, pathname)) {
    return NextResponse.json({ status: 404, code: "unknown" }, { status: 404 });
  }

  const origin = upstreamOrigin();
  if (!origin) {
    return NextResponse.json({ status: 503, code: "network" }, { status: 503 });
  }

  const url = new URL(`${origin}/${pathname}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const headers = new Headers();
  headers.set("Accept", request.headers.get("Accept") ?? "application/json");
  const contentType = request.headers.get("Content-Type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  const authorization = request.headers.get("Authorization");
  if (authorization) {
    headers.set("Authorization", authorization);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch {
    return NextResponse.json({ status: 503, code: "network" }, { status: 503 });
  }

  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get("Content-Type");
  if (upstreamType) {
    responseHeaders.set("Content-Type", upstreamType);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export function GET(request: NextRequest, context: RouteContext) {
  return proxyPublicApi(request, context);
}

export function POST(request: NextRequest, context: RouteContext) {
  return proxyPublicApi(request, context);
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return proxyPublicApi(request, context);
}
