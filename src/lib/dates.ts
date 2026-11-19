import {
  addDays,
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
  startOfDay,
  type Locale,
} from "date-fns";
import {
  bg,
  cs,
  da,
  de,
  el,
  enGB,
  enIE,
  es,
  et,
  fi,
  fr,
  hr,
  hu,
  it,
  lt,
  lv,
  mt,
  nl,
  pl,
  pt,
  ro,
  sk,
  sl,
  sv,
} from "date-fns/locale";
import type { AppLocale } from "@/i18n/routing";

const DATE_LOCALES: Record<AppLocale, Locale> = {
  "bg-BG": bg,
  "cs-CZ": cs,
  "da-DK": da,
  "de-DE": de,
  "el-GR": el,
  "en-GB": enGB,
  "es-ES": es,
  "et-EE": et,
  "fi-FI": fi,
  "fr-FR": fr,
  "ga-IE": enIE,
  "hr-HR": hr,
  "hu-HU": hu,
  "it-IT": it,
  "lt-LT": lt,
  "lv-LV": lv,
  "mt-MT": mt,
  "nl-NL": nl,
  "pl-PL": pl,
  "pt-PT": pt,
  "ro-RO": ro,
  "sk-SK": sk,
  "sl-SI": sl,
  "sv-SE": sv,
};

export function getDateFnsLocale(locale: string): Locale {
  return DATE_LOCALES[locale as AppLocale] ?? DATE_LOCALES["en-GB"];
}

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
  return format(date, "d MMM", { locale: getDateFnsLocale(locale) });
}

export function formatLongDate(date: Date, locale: string): string {
  return format(date, "d MMMM yyyy", { locale: getDateFnsLocale(locale) });
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

export interface DateParts {
  weekday: string;
  day: string;
  monthYear: string;
}

export function formatDateParts(date: Date, locale: string): DateParts {
  const dateLocale = getDateFnsLocale(locale);
  return {
    weekday: format(date, "EEE", { locale: dateLocale }),
    day: format(date, "d", { locale: dateLocale }),
    monthYear: format(date, "MMM yyyy", { locale: dateLocale }),
  };
}
