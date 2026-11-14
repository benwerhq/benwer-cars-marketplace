import { NextResponse } from "next/server";
import { servesGuestAppLinks } from "./guestApp";

const CACHE_CONTROL = "public, max-age=3600";

export function wellKnownJson(
  request: Request,
  build: () => object | null,
): NextResponse {
  const body = servesGuestAppLinks(request.headers.get("host")) ? build() : null;
  if (!body) {
    return NextResponse.json(
      { status: 404, code: "not_found" },
      { status: 404, headers: { "cache-control": "no-store" } },
    );
  }
  return NextResponse.json(body, {
    headers: {
      "content-type": "application/json",
      "cache-control": CACHE_CONTROL,
    },
  });
}
