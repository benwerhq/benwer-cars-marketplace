import { SearchParams } from "@/enums";
import { setHrefParams } from "@/lib/booking";

const BASE = "https://benwer.invalid";

/**
 * A same-site path to return to after sign-in, or null. Rejects absolute URLs,
 * protocol-relative URLs, backslashes and control characters so the param
 * can never send a guest to another site.
 */
export function safeReturnTo(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return null;
  }
  if (/[\u0000-\u001f\u007f]/.test(raw)) {
    return null;
  }
  try {
    const url = new URL(raw, BASE);
    if (url.origin !== BASE) {
      return null;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function withReturnTo(href: string, returnTo: string | null | undefined): string {
  const safe = safeReturnTo(returnTo);
  if (!safe || /\/guest(\/|$|\?)/.test(safe)) {
    return href;
  }
  return setHrefParams(href, { [SearchParams.NEXT]: safe });
}

export function currentReturnTo(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return `${window.location.pathname}${window.location.search}`;
}

export function returnToFromLocation(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return safeReturnTo(new URLSearchParams(window.location.search).get(SearchParams.NEXT));
}
