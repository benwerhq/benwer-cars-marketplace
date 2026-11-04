"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2, Mail } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useReservation } from "@/hooks/useReservation";
import { ApiError, getErrorKey } from "@/lib/errors";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookingVehiclePreview } from "./BookingVehiclePreview";
import { PriceBreakdownList } from "./PriceBreakdownList";
import { NavRoutes, ReservationStatus as ReservationStatusEnum } from "@/enums";
import { countRentalDays, formatLongDate, parseIsoDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

interface ReservationStatusProps {
  token: string;
  browseHref?: string | null;
}

const STATUS_KEYS = {
  [ReservationStatusEnum.DRAFT]: "draft",
  [ReservationStatusEnum.CONFIRMED]: "confirmed",
  [ReservationStatusEnum.ACTIVE]: "active",
  [ReservationStatusEnum.COMPLETED]: "completed",
  [ReservationStatusEnum.CANCELLED]: "cancelled",
} as const;

export function ReservationStatus({
  token,
  browseHref,
}: ReservationStatusProps) {
  const t = useTranslations("reservationStatus");
  const tRoot = useTranslations();
  const tBooking = useTranslations("booking");
  const locale = useLocale();
  const { data, isPending, isError, error, refetch } = useReservation(token);

  if (isPending) return <ReservationStatusSkeleton />;

  if (isError) {
    if (error instanceof ApiError && error.code === "reservation.not_found") {
      return (
        <EmptyState
          icon={<CalendarDays size={40} />}
          title={t("notFoundTitle")}
          description={t("notFoundDescription")}
          actionLabel={t("backHome")}
          actionHref={NavRoutes.HOME}
        />
      );
    }

    return <ErrorState message={tRoot(getErrorKey(error))} onRetry={refetch} />;
  }

  const fromDate = parseIsoDate(data.startDate);
  const toDate = parseIsoDate(data.endDate);
  const days = countRentalDays(data.startDate, data.endDate);
  const total = formatMoney(data.totalPrice, data.currency, locale);
  const statusKey = STATUS_KEYS[data.status] ?? "confirmed";
  const companyName = data.company?.name ?? null;
  const fleetHref =
    browseHref ??
    (data.companySlug
      ? `${NavRoutes.COMPANIES}/${data.companySlug}`
      : NavRoutes.CARS);
  const isSuccess =
    data.status === ReservationStatusEnum.CONFIRMED ||
    data.status === ReservationStatusEnum.ACTIVE;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span
          className={
            isSuccess
              ? "flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success"
              : "flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted-foreground"
          }
        >
          <CheckCircle2 size={28} aria-hidden />
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {isSuccess ? t("successTitle") : t("title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("successSubtitle", { email: data.guestEmail })}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5 shadow-md md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{t("reference")}</p>
            <p className="mt-0.5 font-mono text-sm font-medium tracking-wide text-foreground">
              {data.token.slice(0, 8).toUpperCase()}
            </p>
            <p className="mt-1 text-xs text-subtle-foreground">
              {t("referenceHint")}
            </p>
          </div>
          <StatusBadge status={data.status} label={t(`status.${statusKey}`)} />
        </div>

        {data.vehicle ? (
          <BookingVehiclePreview
            vehicle={data.vehicle}
            companyName={companyName}
            size="md"
          />
        ) : null}

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatusRow
            label={t("pickup")}
            value={fromDate ? formatLongDate(fromDate, locale) : data.startDate}
          />
          <StatusRow
            label={t("dropoff")}
            value={toDate ? formatLongDate(toDate, locale) : data.endDate}
          />
          {days > 0 ? (
            <StatusRow
              label={t("dates")}
              value={tBooking("nights", { count: days })}
            />
          ) : null}
          {companyName ? (
            <StatusRow label={t("company")} value={companyName} />
          ) : null}
          <StatusRow label={t("guest")} value={data.guestName} />
          <StatusRow label={t("email")} value={data.guestEmail} />
          <StatusRow label={t("phone")} value={data.guestPhone} />
        </dl>

        {data.priceBreakdown && data.priceBreakdown.segments.length > 0 ? (
          <PriceBreakdownList
            breakdown={data.priceBreakdown}
            currency={data.currency}
            className="border-t border-border pt-4"
          />
        ) : null}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-medium text-foreground">
            {t("total")}
          </span>
          <span className="text-lg font-semibold tabular-nums text-foreground">
            {total}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-muted/60 p-5">
        <h2 className="text-sm font-semibold text-foreground">
          {t("nextTitle")}
        </h2>
        <ol className="flex flex-col gap-3">
          <li className="flex items-start gap-3 text-sm text-muted-foreground">
            <Mail
              size={16}
              className="mt-0.5 shrink-0 text-primary"
              aria-hidden
            />
            <span>{t("nextEmail", { email: data.guestEmail })}</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-muted-foreground">
            <CalendarDays
              size={16}
              className="mt-0.5 shrink-0 text-primary"
              aria-hidden
            />
            <span>{t("nextPickup")}</span>
          </li>
        </ol>
      </div>

      <div className="flex flex-col items-center gap-4 text-center">
        <ul className="flex flex-wrap justify-center gap-2">
          <li className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Mail size={14} className="text-primary" aria-hidden />
            {t("trustEmail")}
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <CheckCircle2 size={14} className="text-primary" aria-hidden />
            {t("trustPickup")}
          </li>
        </ul>
        <p className="max-w-md text-sm text-muted-foreground">
          {t("trustCopy")}
        </p>
        <Link
          href={fleetHref}
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t("browseMore")}
        </Link>
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function ReservationStatusSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div
        className={cn(
          "flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6",
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-24 w-36 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-7 w-full" />
      </div>
    </div>
  );
}
