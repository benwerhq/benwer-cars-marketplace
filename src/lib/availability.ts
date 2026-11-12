import { addDays, addMonths } from "date-fns";
import { QueryKeys, VehicleStatus } from "@/enums";
import {
  hasCompleteSearchDates,
  listingRangeDates,
  parseIsoDate,
  startOfToday,
  toIsoDate,
} from "@/lib/dates";
import type { Vehicle } from "@/types/vehicle";
import type {
  AvailabilityQuery,
  AvailabilityRange,
} from "@/types/availability";

export const AVAILABILITY_WINDOW_MONTHS = 12;

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
  const dates = listingRangeDates(from, to);
  if (dates.length === 0) {
    return blocked.has(from);
  }
  return dates.some((date) => blocked.has(date));
}

export function defaultFleetDateRange(today = startOfToday()): {
  from: string;
  to: string;
} {
  return {
    from: toIsoDate(today),
    to: toIsoDate(addDays(today, 1)),
  };
}

export function resolveFleetDateRange(
  from: string | undefined,
  to: string | undefined,
): { from: string; to: string } {
  if (hasCompleteSearchDates(from, to) && from && to) {
    return { from, to };
  }
  return defaultFleetDateRange();
}

export function isFleetVehicleAvailable(
  vehicle: Vehicle,
  ranges: AvailabilityRange[] | undefined,
  from: string,
  to: string,
): boolean {
  const hasRow = ranges?.some((row) => row.vehicleId === vehicle.id) ?? false;
  if (hasRow) {
    return !rangeIncludesUnavailable(
      from,
      to,
      unavailableDatesForVehicle(ranges, vehicle.id),
    );
  }
  return vehicle.status === VehicleStatus.AVAILABLE;
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
