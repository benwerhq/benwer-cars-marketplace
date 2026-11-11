import createClient, { type Middleware } from "openapi-fetch";
import { env } from "@/env";
import {
  assertMockCatalogueAllowed,
  collapseDuplicateV1Path,
  joinApiUrl,
  normalizeApiBaseUrl,
  resolveBrowserApiBaseUrl,
} from "@/lib/publicApiProxy";
import { ApiError, type FieldError } from "@/lib/errors";
import { logError } from "@/lib/logger";
import type { paths } from "./schema";

const LIVE_TIMEOUT_MS = 25000;

interface ProblemBody {
  code?: string;
  detail?: string;
  errors?: { field?: string; code?: string }[];
}

const FIELD_ALIASES: Record<string, string> = {
  vehicleID: "vehicleId",
  vehicle_id: "vehicleId",
};

const CODE_ALIASES: Record<string, string> = {
  after_start: "reservation.invalid_dates",
  invalid_dates: "reservation.invalid_dates",
  min_lead: "reservation.min_lead",
  min_notice: "reservation.min_lead",
  "booking.min_lead_hours": "reservation.min_lead",
  "site.min_lead_hours": "reservation.min_lead",
  terms_required: "reservation.terms_required",
  terms_not_accepted: "reservation.terms_required",
  "booking.terms_required": "reservation.terms_required",
  max_open_requests: "reservation.max_open_requests",
  "booking.max_open_requests": "reservation.max_open_requests",
  request_expired: "reservation.request_expired",
  "booking.request_expired": "reservation.request_expired",
  "site.unpublished": "site.not_published",
  payment_not_required: "booking.payment_not_required",
  "booking.payment_not_required": "booking.payment_not_required",
  payment_window_elapsed: "booking.payment_window_elapsed",
  "booking.payment_window_elapsed": "booking.payment_window_elapsed",
  payment_not_open: "booking.payment_not_open",
  "booking.payment_not_open": "booking.payment_not_open",
  not_cancellable: "reservation.not_cancellable",
  "reservation.not_cancellable": "reservation.not_cancellable",
  already_paid: "rental_payments.already_paid",
  "rental_payments.already_paid": "rental_payments.already_paid",
  "guest.not_configured": "guest.not_configured",
  not_configured: "guest.not_configured",
  "guest.not_linked": "guest.not_linked",
  not_linked: "guest.not_linked",
  "guest.invalid_token": "guest.invalid_token",
  invalid_token: "guest.invalid_token",
  "guest.unauthenticated": "guest.unauthenticated",
};

export function liveApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return normalizeApiBaseUrl(env.API_ORIGIN ?? env.NEXT_PUBLIC_API_URL ?? "");
  }

  return resolveBrowserApiBaseUrl(
    env.NEXT_PUBLIC_API_URL ?? "",
    env.NEXT_PUBLIC_ENV,
    window.location.origin,
  );
}

export function isLiveApiConfigured(): boolean {
  return Boolean(liveApiBaseUrl());
}

function normalizeFieldError(error: {
  field?: string;
  code?: string;
}): FieldError {
  const field = error.field ? (FIELD_ALIASES[error.field] ?? error.field) : "";
  const code = error.code
    ? (CODE_ALIASES[error.code] ?? error.code)
    : "unknown";
  return { field, code };
}

function problemCode(status: number, body: ProblemBody): string {
  if (body.code) {
    return body.code;
  }

  if (status === 409) {
    return "reservation.overlap";
  }

  return "unknown";
}

export function throwApiError(status: number, body: ProblemBody): never {
  throw new ApiError(
    status,
    CODE_ALIASES[problemCode(status, body)] ?? problemCode(status, body),
    (body.errors ?? []).map(normalizeFieldError),
    body.detail,
  );
}

export async function publicRequest<T>(
  path: string,
  init?: RequestInit & { query?: Record<string, string | undefined> },
): Promise<T> {
  const baseUrl = liveApiBaseUrl();
  if (!baseUrl) {
    throw new ApiError(0, "network", [], "Live API is not configured");
  }

  const url = new URL(
    joinApiUrl(baseUrl, path),
    typeof window === "undefined" ? env.NEXT_PUBLIC_APP_URL : window.location.origin,
  );
  const { query, ...requestInit } = init ?? {};
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    ...requestInit,
    headers: {
      Accept: "application/json",
      ...requestInit.headers,
    },
    cache: "no-store",
    signal: requestInit.signal ?? AbortSignal.timeout(LIVE_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ProblemBody;
    throwApiError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

const problemMiddleware: Middleware = {
  onRequest({ request }) {
    const headers = new Headers(request.headers);
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    const url = collapseDuplicateV1Path(request.url);
    if (url !== request.url) {
      logError(new Error("collapsed duplicate /v1 in public API URL"), {
        context: "api_base_url",
        from: request.url,
        to: url,
      });
    }
    const source = url === request.url ? request : new Request(url, request);

    return new Request(source, {
      headers,
      cache: "no-store",
      signal: request.signal ?? AbortSignal.timeout(LIVE_TIMEOUT_MS),
    });
  },
  async onResponse({ response }) {
    if (response.ok) {
      return response;
    }

    const body = (await response
      .clone()
      .json()
      .catch(() => ({}))) as ProblemBody;
    throwApiError(response.status, body);
  },
};

let cached: {
  baseUrl: string;
  client: ReturnType<typeof createClient<paths>>;
} | null = null;

export function getOpenApiClient() {
  const baseUrl = liveApiBaseUrl();
  if (!baseUrl) {
    throw new ApiError(0, "network", [], "Live API is not configured");
  }

  if (cached && cached.baseUrl === baseUrl) {
    return cached.client;
  }

  const client = createClient<paths>({ baseUrl });
  client.use(problemMiddleware);
  cached = { baseUrl, client };
  return client;
}

function mockUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (typeof window !== "undefined") {
    return path;
  }

  return new URL(path, env.NEXT_PUBLIC_APP_URL).toString();
}

export const mockClient = {
  get<T>(path: string): Promise<T> {
    assertMockCatalogueAllowed(env.NEXT_PUBLIC_ENV, process.env.NODE_ENV);

    return fetch(mockUrl(path), { cache: "no-store" }).then((response) => {
      if (!response.ok) {
        throw new ApiError(response.status, "unknown");
      }

      return response.json() as Promise<T>;
    });
  },
};
