/**
 * What a guest typed on the booking form, kept in sessionStorage per company
 * and car so Change dates, back, refresh and a language switch don't lose it.
 * sessionStorage is per tab and per origin, and is cleared once booked.
 */
export interface BookingDraft {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  acceptTerms?: boolean;
  startDate?: string;
  endDate?: string;
  insurancePackageId?: string;
  addonIds?: string[];
  pickupTime?: string;
  returnTime?: string;
  flightNumber?: string;
  notes?: string;
  dateOfBirth?: string;
}

const PREFIX = "benwer:booking-draft";
const STRING_FIELDS = [
  "guestName",
  "guestEmail",
  "guestPhone",
  "startDate",
  "endDate",
  "insurancePackageId",
  "pickupTime",
  "returnTime",
  "flightNumber",
  "notes",
  "dateOfBirth",
] as const;

export function bookingDraftKey(companySlug: string, vehicleId: string): string {
  return `${PREFIX}:${companySlug}:${vehicleId}`;
}

export function sanitizeBookingDraft(value: unknown): BookingDraft | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as Record<string, unknown>;
  const draft: BookingDraft = {};
  for (const field of STRING_FIELDS) {
    const item = row[field];
    if (typeof item === "string") {
      draft[field] = item.slice(0, 2000);
    }
  }
  if (typeof row.acceptTerms === "boolean") {
    draft.acceptTerms = row.acceptTerms;
  }
  if (Array.isArray(row.addonIds)) {
    draft.addonIds = row.addonIds
      .filter((id): id is string => typeof id === "string")
      .slice(0, 20);
  }
  return draft;
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readBookingDraft(key: string): BookingDraft | null {
  try {
    const raw = storage()?.getItem(key);
    return raw ? sanitizeBookingDraft(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function writeBookingDraft(key: string, draft: BookingDraft): void {
  try {
    storage()?.setItem(key, JSON.stringify(draft));
  } catch {
    /* storage full or blocked: the form still works, it just won't persist */
  }
}

export function clearBookingDraft(key: string): void {
  try {
    storage()?.removeItem(key);
  } catch {
    /* ignore */
  }
}
