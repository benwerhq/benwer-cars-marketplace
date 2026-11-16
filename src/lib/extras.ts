import { env } from "@/env";

/** A bookable extra (child seat, GPS, extra driver...) from the public API. */
export interface PublicExtra {
  id: string;
  kind: string;
  name: Record<string, string> | null;
  shortDescription: Record<string, string> | null;
  type: "per_day" | "fixed";
  price: number;
  availableQuantity: number | null;
}

/**
 * Pick-up/return time, flight number, comments and date of birth. Off until
 * the API stores them (it silently drops unknown fields today), so guests
 * aren't asked for data that is thrown away.
 */
export function guestBookingFieldsEnabled(): boolean {
  return env.NEXT_PUBLIC_GUEST_BOOKING_FIELDS === "true";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringRecord(value: unknown): Record<string, string> | null {
  if (!isRecord(value)) {
    return null;
  }
  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

function toNumber(value: unknown): number | null {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}

export function mapExtras(raw: unknown): PublicExtra[] {
  const list = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.data)
      ? raw.data
      : isRecord(raw) && Array.isArray(raw.items)
        ? raw.items
        : [];
  const extras: PublicExtra[] = [];
  for (const row of list) {
    if (!isRecord(row) || typeof row.id !== "string") {
      continue;
    }
    const price = toNumber(row.price);
    if (price === null) {
      continue;
    }
    extras.push({
      id: row.id,
      kind: typeof row.kind === "string" ? row.kind : "",
      name: stringRecord(row.name),
      shortDescription: stringRecord(row.shortDescription),
      type: row.type === "fixed" ? "fixed" : "per_day",
      price,
      availableQuantity: toNumber(row.availableQuantity),
    });
  }
  return extras;
}

export function extraLineTotal(extra: PublicExtra, days: number): number {
  const amount = extra.type === "per_day" ? extra.price * Math.max(days, 0) : extra.price;
  return Math.round(amount * 100) / 100;
}

export function extrasTotal(
  extras: PublicExtra[] | undefined,
  selectedIds: string[],
  days: number,
): number {
  const selected = new Set(selectedIds);
  const total = (extras ?? [])
    .filter((extra) => selected.has(extra.id))
    .reduce((sum, extra) => sum + extraLineTotal(extra, days), 0);
  return Math.round(total * 100) / 100;
}

const AIRPORT = /\b(airport|aeropuerto|aeroporto|a[eé]rodrome|terminal)\b|\bAGP\b/i;

/** Whether a pick-up branch looks like an airport desk. */
export function isAirportBranch(
  branch: { name?: string | null; address?: string | null } | null | undefined,
): boolean {
  if (!branch) {
    return false;
  }
  return AIRPORT.test(`${branch.name ?? ""} ${branch.address ?? ""}`);
}

/** Half-hour pick-up/return slots during the day. */
export const TIME_SLOTS: string[] = Array.from({ length: 31 }, (_, index) => {
  const minutes = 7 * 60 + index * 30;
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  return `${hours}:${minutes % 60 === 0 ? "00" : "30"}`;
});
