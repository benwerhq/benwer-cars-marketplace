import { addDays, addMonths } from "date-fns";
import { QueryKeys } from "@/enums";
import {
  listingRangeDates,
  parseIsoDate,
  startOfToday,
  toIsoDate,
} from "@/lib/dates";
import type {
  AvailabilityQuery,
  AvailabilityRange,
} from "@/types/availability";

export const AVAILABILITY_WINDOW_MONTHS = 3;

export function availabilityCalendarWindow(today = startOfToday()): {
  from: string;
  to: string;
} {
  return {
    from: toIsoDate(today),
    to: toIsoDate(addMonths(today, AVAILABILITY_WINDOW_MONTHS)),
  };
}

export function availabilityQueryKey(
  companySlug: string,
  params: AvailabilityQuery,
) {
  return [
    QueryKeys.AVAILABILITY,
    companySlug,
    params.from,
    params.to,
    params.vehicleId ?? null,
    params.channel ?? null,
  ] as const;
}

export function unavailableDatesForVehicle(
  ranges: AvailabilityRange[] | undefined,
  vehicleId: string,
): string[] {
  return (
    ranges?.find((row) => row.vehicleId === vehicleId)?.unavailableDates ?? []
  );
}

export function parseUnavailableDates(dates: string[]): Date[] {
  return dates.map(parseIsoDate).filter((date): date is Date => date !== null);
}

export function rangeIncludesUnavailable(
  from: string,
  to: string,
  unavailableDates: string[],
): boolean {
  if (unavailableDates.length === 0) {
    return false;
  }

  const blocked = new Set(unavailableDates);
  return listingRangeDates(from, to).some((date) => blocked.has(date));
}

export function firstUnavailableOnOrAfter(
  from: string,
  unavailableDates: string[],
): Date | null {
  const start = parseIsoDate(from);
  if (!start) {
    return null;
  }

  return (
    parseUnavailableDates(unavailableDates)
      .filter((date) => date >= start)
      .sort((a, b) => a.getTime() - b.getTime())[0] ?? null
  );
}

export function sanitizeDateRange(
  from: string | undefined,
  to: string | undefined,
  min = startOfToday(),
): { from: string; to: string } {
  const start = from ? parseIsoDate(from) : null;
  if (!start || start < min) {
    return { from: "", to: "" };
  }

  const nextFrom = toIsoDate(start);
  const end = to ? parseIsoDate(to) : null;
  if (!end || end <= start) {
    return { from: nextFrom, to: "" };
  }

  return { from: nextFrom, to: toIsoDate(end) };
}

export function ensureVisibleUnavailableDates(
  dates: string[],
  from: string,
  to: string,
): string[] {
  const start = parseIsoDate(from);
  const end = parseIsoDate(to);
  if (!start) {
    return dates;
  }

  const hasVisible = dates.some((iso) => {
    const date = parseIsoDate(iso);
    return Boolean(date && date >= start && (!end || date < end));
  });

  if (hasVisible) {
    return dates;
  }

  return [
    ...dates,
    toIsoDate(addDays(start, 7)),
    toIsoDate(addDays(start, 8)),
    toIsoDate(addDays(start, 9)),
  ];
}
