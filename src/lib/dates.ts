import {
  addDays,
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";
import { enGB, es, pt } from "date-fns/locale";

const DATE_LOCALES = {
  "en-GB": enGB,
  "es-ES": es,
  "pt-PT": pt,
} as const;

export function hasCompleteSearchDates(
  from: string | undefined,
  to: string | undefined,
): boolean {
  if (!from || !to) {
    return false;
  }

  const start = parseIsoDate(from);
  const end = parseIsoDate(to);
  if (!start || !end) {
    return false;
  }

  return end >= start;
}

export function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return null;
  }

  return startOfDay(parsed);
}

export function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatSearchDate(date: Date, locale: string): string {
  const dateLocale =
    DATE_LOCALES[locale as keyof typeof DATE_LOCALES] ?? DATE_LOCALES["en-GB"];
  return format(date, "d MMM", { locale: dateLocale });
}

export function formatLongDate(date: Date, locale: string): string {
  const dateLocale =
    DATE_LOCALES[locale as keyof typeof DATE_LOCALES] ?? DATE_LOCALES["en-GB"];
  return format(date, "d MMMM yyyy", { locale: dateLocale });
}

export function startOfToday(): Date {
  return startOfDay(new Date());
}

export function addCalendarDays(iso: string, days: number): string | null {
  const date = parseIsoDate(iso);
  if (!date) {
    return null;
  }

  return toIsoDate(addDays(date, days));
}

export function countRentalDays(from: string, to: string): number {
  const start = parseIsoDate(from);
  const end = parseIsoDate(to);
  if (!start || !end) {
    return 0;
  }

  return Math.max(0, differenceInCalendarDays(end, start));
}

export function dateRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const aStart = parseIsoDate(startA);
  const aEnd = parseIsoDate(endA);
  const bStart = parseIsoDate(startB);
  const bEnd = parseIsoDate(endB);
  if (!aStart || !aEnd || !bStart || !bEnd) {
    return false;
  }

  return aStart < bEnd && bStart < aEnd;
}

export function listingRangeDates(from: string, to: string): string[] {
  const start = parseIsoDate(from);
  const end = parseIsoDate(to);
  if (!start || !end || end <= start) {
    return [];
  }

  const dates: string[] = [];
  let cursor = start;
  while (cursor < end) {
    dates.push(toIsoDate(cursor));
    cursor = addDays(cursor, 1);
  }

  return dates;
}
