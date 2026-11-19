import type { QueryClient } from "@tanstack/react-query";
import { env } from "@/env";
import { QueryKeys } from "@/enums";
import { getGuestAccessToken } from "@/lib/guestAccessToken";
import { joinApiUrl, normalizeApiBaseUrl } from "@/lib/publicApiProxy";

export interface PublicRealtimeEvent {
  id: string;
  entity: string;
  type: string;
  companySlug: string;
  entityId?: string;
  at: string;
}

export interface GuestRealtimeEvent {
  id: string;
  guestAccountId: string;
  type: string;
  notificationId?: string;
  reservationId?: string;
  vehicleId?: string;
  companySlug?: string;
  title?: string;
  body?: string;
  at: string;
}

export interface TokenReservationRealtimeEvent {
  id: string;
  type: string;
  at: string;
}

export interface RealtimeConnection {
  close: () => void;
}

export type RealtimeQueryKey = QueryKeys | "public-extras";

export const PUBLIC_INVALIDATION_DEBOUNCE_MS = 300;
export const PUBLIC_INVALIDATION_JITTER_MS = 1_200;
export const GUEST_INVALIDATION_DEBOUNCE_MS = 250;
export const HIDDEN_TAB_DISCONNECT_MS = 30_000;

const MIN_BACKOFF_MS = 1_000;
const MAX_STREAM_FAILURES = 5;
const MAX_BACKOFF_MS = 30_000;
const BLOCK_END = /\r?\n\r?\n/;
const BLOCK_END_PREFIX = /^\r?\n\r?\n/;

const PUBLIC_FOREGROUND_KEYS: readonly RealtimeQueryKey[] = [
  QueryKeys.COMPANIES,
  QueryKeys.COMPANY,
  QueryKeys.VEHICLES,
  QueryKeys.VEHICLE,
  QueryKeys.AVAILABILITY,
  QueryKeys.SITE,
] as const;

const GUEST_FOREGROUND_KEYS: readonly RealtimeQueryKey[] = [
  QueryKeys.GUEST,
  QueryKeys.GUEST_RESERVATIONS,
  QueryKeys.GUEST_NOTIFICATIONS,
  QueryKeys.GUEST_NOTIFICATIONS_UNREAD,
] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

/**
 * Direct API origin for long-lived SSE streams.
 * Bypasses Next.js `/api/[...path]` so Vercel serverless timeouts do not kill streams.
 */
export function realtimeApiBaseUrl(): string {
  return normalizeApiBaseUrl(env.NEXT_PUBLIC_API_URL ?? "");
}

export function parsePublicRealtimeEvent(raw: unknown): PublicRealtimeEvent | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }
  const id = readString(record.id);
  const entity = readString(record.entity);
  const type = readString(record.type);
  const companySlug = readString(record.companySlug);
  const at = readString(record.at);
  if (!id || !entity || !type || !companySlug || !at) {
    return null;
  }
  return {
    id,
    entity,
    type,
    companySlug,
    entityId: readString(record.entityId) ?? undefined,
    at,
  };
}

export function parseGuestRealtimeEvent(raw: unknown): GuestRealtimeEvent | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }
  const id = readString(record.id);
  const guestAccountId = readString(record.guestAccountId);
  const type = readString(record.type);
  const at = readString(record.at);
  if (!id || !guestAccountId || !type || !at) {
    return null;
  }
  return {
    id,
    guestAccountId,
    type,
    notificationId: readString(record.notificationId) ?? undefined,
    reservationId: readString(record.reservationId) ?? undefined,
    vehicleId: readString(record.vehicleId) ?? undefined,
    companySlug: readString(record.companySlug) ?? undefined,
    title: readString(record.title) ?? undefined,
    body: readString(record.body) ?? undefined,
    at,
  };
}

export function parseTokenReservationEvent(raw: unknown): TokenReservationRealtimeEvent | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }
  const id = readString(record.id);
  const type = readString(record.type);
  const at = readString(record.at);
  if (!id || !type || !at) {
    return null;
  }
  return { id, type, at };
}

export function queryKeysForPublicEvent(event: PublicRealtimeEvent): RealtimeQueryKey[] {
  const keys = new Set<RealtimeQueryKey>();
  switch (event.entity.toLowerCase()) {
    case "vehicle":
      keys.add(QueryKeys.VEHICLES);
      keys.add(QueryKeys.VEHICLE);
      break;
    case "availability":
      keys.add(QueryKeys.AVAILABILITY);
      keys.add(QueryKeys.PRICE_QUOTE);
      keys.add(QueryKeys.VEHICLES);
      break;
    case "company":
      keys.add(QueryKeys.COMPANIES);
      keys.add(QueryKeys.COMPANY);
      keys.add(QueryKeys.SITE);
      break;
    case "site":
      keys.add(QueryKeys.SITE);
      keys.add(QueryKeys.COMPANY);
      break;
    case "extra":
      keys.add("public-extras");
      keys.add(QueryKeys.PRICE_QUOTE);
      break;
    case "insurance":
      keys.add(QueryKeys.INSURANCE);
      keys.add(QueryKeys.PRICE_QUOTE);
      break;
    case "pricing":
      keys.add(QueryKeys.PRICE_QUOTE);
      keys.add(QueryKeys.ONE_WAY_FEE);
      keys.add(QueryKeys.VEHICLES);
      keys.add(QueryKeys.VEHICLE);
      break;
    default:
      break;
  }
  return [...keys];
}

export function queryKeysForGuestEvent(event: GuestRealtimeEvent): RealtimeQueryKey[] {
  const type = event.type.toLowerCase();
  const keys = new Set<RealtimeQueryKey>();

  if (type.startsWith("notification.")) {
    keys.add(QueryKeys.GUEST_NOTIFICATIONS);
    keys.add(QueryKeys.GUEST_NOTIFICATIONS_UNREAD);
    if (event.reservationId) {
      keys.add(QueryKeys.GUEST_RESERVATIONS);
      keys.add(QueryKeys.RESERVATION);
    }
    return [...keys];
  }
  if (type.startsWith("reservation.") || type === "payment.updated") {
    keys.add(QueryKeys.GUEST_RESERVATIONS);
    keys.add(QueryKeys.RESERVATION);
    keys.add(QueryKeys.PAYMENT);
    keys.add(QueryKeys.CANCELLATION_QUOTE);
    return [...keys];
  }
  if (type === "profile.updated" || type === "company.linked" || type === "company.unlinked") {
    keys.add(QueryKeys.GUEST);
    if (type === "company.linked" || type === "company.unlinked") {
      keys.add(QueryKeys.GUEST_RESERVATIONS);
    }
  }
  return [...keys];
}

export function invalidateActiveQueryKeys(
  queryClient: QueryClient,
  keys: Iterable<RealtimeQueryKey>,
): void {
  for (const key of keys) {
    void queryClient.invalidateQueries({ queryKey: [key], refetchType: "active" });
  }
}

export function invalidateForegroundQueries(
  queryClient: QueryClient,
  includeGuest: boolean,
): void {
  invalidateActiveQueryKeys(queryClient, PUBLIC_FOREGROUND_KEYS);
  if (includeGuest) {
    invalidateActiveQueryKeys(queryClient, GUEST_FOREGROUND_KEYS);
  }
}

export function createInvalidationDebouncer(
  queryClient: QueryClient,
  options?: { delayMs?: number; jitterMaxMs?: number },
): {
  enqueue: (keys: readonly RealtimeQueryKey[]) => void;
  flush: () => void;
  clear: () => void;
} {
  const delayMs = options?.delayMs ?? GUEST_INVALIDATION_DEBOUNCE_MS;
  const jitterMaxMs = options?.jitterMaxMs ?? 0;
  const pending = new Set<RealtimeQueryKey>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (pending.size === 0) {
      return;
    }
    const keys = [...pending];
    pending.clear();
    invalidateActiveQueryKeys(queryClient, keys);
  };

  return {
    enqueue(keys) {
      if (keys.length === 0) {
        return;
      }
      for (const key of keys) {
        pending.add(key);
      }
      if (timer) {
        clearTimeout(timer);
      }
      const jitter = jitterMaxMs > 0 ? Math.floor(Math.random() * jitterMaxMs) : 0;
      timer = setTimeout(flush, delayMs + jitter);
    },
    flush,
    clear() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      pending.clear();
    },
  };
}

/** Extract company slug from `/s/{slug}` paths when browsing a company site on the platform host. */
export function companySlugFromPathname(pathname: string | null): string | null {
  if (!pathname) {
    return null;
  }
  const match = /^\/s\/([^/?#]+)/i.exec(pathname);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function connectEventSource<T>(
  url: string,
  parse: (raw: unknown) => T | null,
  onEvent: (event: T) => void,
): RealtimeConnection {
  if (typeof window === "undefined" || typeof EventSource === "undefined") {
    return { close: () => undefined };
  }
  const source = new EventSource(url);
  // EventSource retries forever; give up on a stream that keeps failing before it opens
  // (unknown company or booking), so it does not spam 404s on later pages.
  let failures = 0;
  source.onopen = () => {
    failures = 0;
  };
  source.onerror = () => {
    failures += 1;
    if (failures >= MAX_STREAM_FAILURES) {
      source.close();
    }
  };
  source.onmessage = (message) => {
    try {
      const parsed = parse(JSON.parse(message.data) as unknown);
      if (parsed) {
        onEvent(parsed);
      }
    } catch {
      // Ignore malformed SSE payloads.
    }
  };
  return {
    close() {
      source.close();
    },
  };
}

export function connectPublicRealtime(options: {
  companySlug?: string | null;
  onEvent: (event: PublicRealtimeEvent) => void;
}): RealtimeConnection {
  const base = realtimeApiBaseUrl();
  if (!base) {
    return { close: () => undefined };
  }
  const slug = options.companySlug?.trim();
  const path = slug
    ? `/v1/public/events?companySlug=${encodeURIComponent(slug)}`
    : "/v1/public/events";
  return connectEventSource(
    joinApiUrl(base, path),
    parsePublicRealtimeEvent,
    options.onEvent,
  );
}

export function connectTokenReservationRealtime(options: {
  token: string;
  onEvent: (event: TokenReservationRealtimeEvent) => void;
}): RealtimeConnection {
  const base = realtimeApiBaseUrl();
  const token = options.token.trim();
  if (!base || !token) {
    return { close: () => undefined };
  }
  const path = `/v1/public/reservations/${encodeURIComponent(token)}/events`;
  return connectEventSource(
    joinApiUrl(base, path),
    parseTokenReservationEvent,
    options.onEvent,
  );
}

async function* readUnnamedMessages(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) {
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      let boundary = buffer.search(BLOCK_END);
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary).replace(BLOCK_END_PREFIX, "");
        const lines = block.split(/\r?\n/);
        const isNamed = lines.some((line) => line.startsWith("event:"));
        const data = lines
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n");
        if (!isNamed && data) {
          yield data;
        }
        boundary = buffer.search(BLOCK_END);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function connectGuestRealtime(options: {
  onEvent: (event: GuestRealtimeEvent) => void;
}): RealtimeConnection {
  if (typeof window === "undefined") {
    return { close: () => undefined };
  }
  const base = realtimeApiBaseUrl();
  if (!base) {
    return { close: () => undefined };
  }

  let closed = false;
  let controller: AbortController | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let backoffMs = MIN_BACKOFF_MS;

  const scheduleReconnect = () => {
    if (closed) {
      return;
    }
    if (retryTimer) {
      clearTimeout(retryTimer);
    }
    const delay = backoffMs;
    backoffMs = Math.min(MAX_BACKOFF_MS, Math.round(backoffMs * 1.8));
    retryTimer = setTimeout(() => {
      void open();
    }, delay);
  };

  const open = async () => {
    if (closed) {
      return;
    }
    const token = await getGuestAccessToken();
    if (!token || closed) {
      return;
    }
    controller?.abort();
    const current = new AbortController();
    controller = current;
    try {
      const response = await fetch(joinApiUrl(base, "/v1/public/guest/events"), {
        headers: {
          Accept: "text/event-stream",
          Authorization: `Bearer ${token}`,
        },
        signal: current.signal,
      });
      if (!response.ok || !response.body) {
        throw new Error(`guest SSE failed: ${response.status}`);
      }
      backoffMs = MIN_BACKOFF_MS;
      for await (const raw of readUnnamedMessages(response.body)) {
        try {
          const parsed = parseGuestRealtimeEvent(JSON.parse(raw) as unknown);
          if (parsed) {
            options.onEvent(parsed);
          }
        } catch {
          // Ignore malformed payloads.
        }
      }
    } catch {
      if (closed || current.signal.aborted) {
        return;
      }
    }
    scheduleReconnect();
  };

  void open();

  return {
    close() {
      closed = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      controller?.abort();
      controller = null;
    },
  };
}
