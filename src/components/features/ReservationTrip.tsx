"use client";

import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { countRentalDays, formatDateParts, parseIsoDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface ReservationTripProps {
  startDate: string;
  endDate: string;
  pickupTime?: string | null;
  returnTime?: string | null;
  size?: "sm" | "md";
  className?: string;
}

function TripDate({
  label,
  iso,
  time,
  size,
}: {
  label: string;
  iso: string;
  time?: string | null;
  size: "sm" | "md";
}) {
  const locale = useLocale();
  const date = parseIsoDate(iso);
  const parts = date ? formatDateParts(date, locale) : null;

  return (
    <div className="flex min-w-0 flex-col">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {parts ? (
        <span className="mt-1 flex items-baseline gap-1.5 sm:gap-2">
          <span
            className={cn(
              "font-semibold tabular-nums text-foreground",
              size === "md" ? "text-3xl" : "text-xl sm:text-2xl",
            )}
          >
            {parts.day}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-sm font-medium whitespace-nowrap text-foreground">
              {parts.monthYear}
            </span>
            <span className="truncate text-xs text-muted-foreground capitalize">
              {time ? `${parts.weekday} · ${time}` : parts.weekday}
            </span>
          </span>
        </span>
      ) : (
        <span className="mt-1 text-sm font-medium text-foreground">{iso}</span>
      )}
    </div>
  );
}

export function ReservationTrip({
  startDate,
  endDate,
  pickupTime,
  returnTime,
  size = "sm",
  className,
}: ReservationTripProps) {
  const t = useTranslations("reservationStatus");
  const tBooking = useTranslations("booking");
  const days = countRentalDays(startDate, endDate);

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-xl bg-surface-muted px-3 py-3 sm:gap-3 sm:px-4",
        size === "md" && "gap-4 px-5 py-4",
        className,
      )}
    >
      <TripDate label={t("pickup")} iso={startDate} time={pickupTime} size={size} />
      <span className="flex flex-col items-center gap-1 text-muted-foreground">
        <ArrowRight size={size === "md" ? 20 : 16} aria-hidden />
        {days > 0 ? (
          <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-foreground">
            {tBooking("nights", { count: days })}
          </span>
        ) : null}
      </span>
      <TripDate label={t("dropoff")} iso={endDate} time={returnTime} size={size} />
    </div>
  );
}
