"use client";

import { useMemo } from "react";
import { addMonths } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { DayPicker, type DateRange, type Matcher } from "react-day-picker";
import { enGB, es, pt } from "react-day-picker/locale";
import { AvailabilityCalendarSkeleton } from "./AvailabilityCalendarSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  AVAILABILITY_WINDOW_MONTHS,
  firstUnavailableOnOrAfter,
  parseUnavailableDates,
  rangeIncludesUnavailable,
} from "@/lib/availability";
import {
  formatLongDate,
  parseIsoDate,
  startOfToday,
  toIsoDate,
} from "@/lib/dates";
import { cn } from "@/lib/utils";
import "react-day-picker/style.css";

interface AvailabilityCalendarProps {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
  unavailableDates: string[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  className?: string;
}

export function AvailabilityCalendar({
  from,
  to,
  onChange,
  unavailableDates,
  isPending,
  isError,
  onRetry,
  className,
}: AvailabilityCalendarProps) {
  const t = useTranslations("carDetail");
  const locale = useLocale();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const today = startOfToday();
  const fromDate = parseIsoDate(from);
  const toDate = parseIsoDate(to);
  const unavailableDateObjects = useMemo(
    () => parseUnavailableDates(unavailableDates),
    [unavailableDates],
  );

  const selected: DateRange | undefined =
    fromDate || toDate
      ? { from: fromDate ?? undefined, to: toDate ?? undefined }
      : undefined;

  const disabled = useMemo<Matcher[]>(() => {
    const matchers: Matcher[] = [
      { before: today },
      { after: addMonths(today, AVAILABILITY_WINDOW_MONTHS) },
    ];
    const maxDropoff =
      fromDate && !toDate
        ? firstUnavailableOnOrAfter(from, unavailableDates)
        : null;

    if (maxDropoff) {
      matchers.push({ after: maxDropoff });
      matchers.push(
        ...unavailableDateObjects.filter(
          (date) => date.getTime() !== maxDropoff.getTime(),
        ),
      );
      return matchers;
    }

    matchers.push(...unavailableDateObjects);
    return matchers;
  }, [from, fromDate, toDate, today, unavailableDateObjects, unavailableDates]);

  const status = rangeStatus(fromDate, toDate, locale, t);

  function handleSelect(range: DateRange | undefined) {
    if (!range?.from) {
      onChange({ from: "", to: "" });
      return;
    }

    const nextFrom = toIsoDate(range.from);
    const nextTo = range.to && range.to > range.from ? toIsoDate(range.to) : "";

    if (
      nextFrom &&
      nextTo &&
      rangeIncludesUnavailable(nextFrom, nextTo, unavailableDates)
    ) {
      onChange({ from: nextFrom, to: "" });
      return;
    }

    onChange({ from: nextFrom, to: nextTo });
  }

  return (
    <section
      className={cn(
        "flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5",
        className,
      )}
      aria-labelledby="availability-heading"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2
            id="availability-heading"
            className="text-xl font-semibold text-foreground"
          >
            {t("availability")}
          </h2>
          <p className="text-sm text-muted-foreground">{status}</p>
        </div>
        {fromDate ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange({ from: "", to: "" })}
          >
            {t("clearDates")}
          </Button>
        ) : null}
      </div>

      {isPending ? <AvailabilityCalendarSkeleton /> : null}

      {isError ? (
        <ErrorState
          message={t("availabilityError")}
          onRetry={onRetry}
          className="py-8"
        />
      ) : null}

      {!isPending && !isError ? (
        <>
          <DayPicker
            mode="range"
            locale={locale === "es-ES" ? es : locale === "pt-PT" ? pt : enGB}
            numberOfMonths={isDesktop ? 2 : 1}
            selected={selected}
            onSelect={handleSelect}
            disabled={disabled}
            modifiers={{ unavailable: unavailableDateObjects }}
            modifiersClassNames={{ unavailable: "rdp-unavailable" }}
            startMonth={today}
            endMonth={availabilityEndMonth(today)}
            navLayout="around"
            resetOnSelect
            className="marketplace-day-picker w-full"
            aria-label={t("calendarLabel")}
          />
          <CalendarLegend hasUnavailable={unavailableDateObjects.length > 0} />
        </>
      ) : null}
    </section>
  );
}

function CalendarLegend({ hasUnavailable }: { hasUnavailable: boolean }) {
  const t = useTranslations("carDetail");

  return (
    <ul
      className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
      aria-label={t("legend")}
    >
      <LegendSwatch
        className="border border-border bg-surface"
        label={t("available")}
      />
      <LegendSwatch className="bg-primary" label={t("selected")} />
      {hasUnavailable ? (
        <LegendSwatch
          className="bg-surface-muted text-muted-foreground line-through"
          label={t("unavailable")}
        />
      ) : (
        <li className="flex items-center gap-1.5">
          <CalendarDays size={14} aria-hidden />
          {t("openDates", { months: AVAILABILITY_WINDOW_MONTHS })}
        </li>
      )}
    </ul>
  );
}

function LegendSwatch({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <li className="flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-sm",
          className,
        )}
      />
      {label}
    </li>
  );
}

function availabilityEndMonth(today: Date): Date {
  return new Date(
    today.getFullYear(),
    today.getMonth() + AVAILABILITY_WINDOW_MONTHS,
    1,
  );
}

function rangeStatus(
  fromDate: Date | null,
  toDate: Date | null,
  locale: string,
  t: ReturnType<typeof useTranslations>,
): string {
  if (fromDate && toDate) {
    return t("selectedRange", {
      from: formatLongDate(fromDate, locale),
      to: formatLongDate(toDate, locale),
    });
  }

  if (fromDate) {
    return t("selectDropoff");
  }

  return t("selectPickup");
}
