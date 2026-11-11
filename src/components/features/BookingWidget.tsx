"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { buildBookHref } from "@/lib/booking";
import { buildCompanySiteHref } from "@/lib/companySite";
import { countRentalDays, formatLongDate, parseIsoDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";

interface BookingWidgetProps {
  vehicle: Vehicle;
  companySlug: string;
  companyName?: string;
  companyWebsiteUrl?: string | null;
  isTenant?: boolean;
  from: string;
  to: string;
  isRangeBlocked: boolean;
  isAvailabilityPending: boolean;
  isAvailabilityError: boolean;
  className?: string;
  bookingsEnabled?: boolean;
  bookHrefOverride?: string | null;
  requestMode?: boolean;
}

export function BookingWidget({
  vehicle,
  companySlug,
  companyName,
  companyWebsiteUrl,
  isTenant = false,
  from,
  to,
  isRangeBlocked,
  isAvailabilityPending,
  isAvailabilityError,
  className,
  bookingsEnabled = true,
  bookHrefOverride,
  requestMode = false,
}: BookingWidgetProps) {
  const t = useTranslations("booking");
  const tCars = useTranslations("cars");
  const tDetail = useTranslations("carDetail");
  const locale = useLocale();

  const days = countRentalDays(from, to);
  const canBook =
    days > 0 &&
    !isRangeBlocked &&
    !isAvailabilityPending &&
    !isAvailabilityError;
  const total = canBook ? days * vehicle.pricePerDay : null;
  const handoffHref = buildCompanySiteHref({
    slug: companySlug,
    websiteUrl: companyWebsiteUrl,
    path: `/cars/${encodeURIComponent(vehicle.id)}`,
    from: from || undefined,
    to: to || undefined,
  });
  const tenantBookHref = canBook
    ? (bookHrefOverride ??
      buildBookHref({
        companySlug,
        carId: vehicle.id,
        from,
        to,
      }))
    : null;
  const bookHref = !bookingsEnabled
    ? null
    : isTenant
      ? tenantBookHref
      : handoffHref;

  const priceFormatted = formatMoney(
    vehicle.pricePerDay,
    vehicle.currency,
    locale,
  );
  const totalFormatted = total
    ? formatMoney(total, vehicle.currency, locale)
    : null;
  const fromDate = parseIsoDate(from);
  const toDate = parseIsoDate(to);
  const ctaLabel = bookCtaLabel({
    isTenant,
    companyName,
    from,
    to,
    days,
    isRangeBlocked,
    isAvailabilityPending,
    isAvailabilityError,
    bookingsEnabled,
    requestMode,
    t,
    tDetail,
  });

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 shadow-md",
          "lg:sticky lg:top-20",
          className,
        )}
      >
        <p className="text-2xl font-semibold tabular-nums text-foreground">
          {tCars("perDay", { price: priceFormatted })}
        </p>

        <dl className="flex flex-col gap-3">
          <DateSummaryRow
            label={t("startDate")}
            value={
              fromDate ? formatLongDate(fromDate, locale) : tDetail("addDate")
            }
            isPlaceholder={!fromDate}
          />
          <DateSummaryRow
            label={t("endDate")}
            value={toDate ? formatLongDate(toDate, locale) : tDetail("addDate")}
            isPlaceholder={!toDate}
          />
        </dl>

        {isRangeBlocked ? (
          <p className="text-sm text-danger" role="alert">
            {tDetail("notAvailable")}
          </p>
        ) : null}

        {totalFormatted && days > 0 && !isRangeBlocked ? (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">
              {priceFormatted} × {t("nights", { count: days })}
            </span>
            <span className="text-base font-semibold tabular-nums text-foreground">
              {totalFormatted}
            </span>
          </div>
        ) : null}

        {!isTenant ? (
          <p className="text-xs text-muted-foreground">
            {tDetail("handoffHint")}
          </p>
        ) : null}

        <BookingCta
          href={bookHref}
          label={ctaLabel}
          external={!isTenant}
          className="hidden lg:inline-flex"
        />
      </div>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface px-4 pt-3 shadow-md lg:hidden",
          "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold tabular-nums text-foreground">
              {totalFormatted ?? priceFormatted}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {totalFormatted && days > 0
                ? t("nights", { count: days })
                : tCars("perDay", { price: priceFormatted })}
            </p>
          </div>
          <BookingCta
            href={bookHref}
            label={ctaLabel}
            external={!isTenant}
            className="w-auto min-w-36"
          />
        </div>
      </div>
    </>
  );
}

function DateSummaryRow({
  label,
  value,
  isPlaceholder,
}: {
  label: string;
  value: string;
  isPlaceholder: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-sm font-medium",
          isPlaceholder ? "text-subtle-foreground" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function BookingCta({
  href,
  label,
  external,
  className,
}: {
  href: string | null;
  label: string;
  external?: boolean;
  className?: string;
}) {
  if (href) {
    const classes = cn(
      "inline-flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    );

    if (external) {
      return (
        <a href={href} className={classes}>
          {label}
          <ArrowUpRight size={16} aria-hidden />
        </a>
      );
    }

    return (
      <Link href={href} className={classes}>
        {label}
      </Link>
    );
  }

  return (
    <Button disabled className={cn("h-11 w-full", className)}>
      {label}
    </Button>
  );
}

function bookCtaLabel({
  isTenant,
  companyName,
  from,
  to,
  days,
  isRangeBlocked,
  isAvailabilityPending,
  isAvailabilityError,
  bookingsEnabled,
  requestMode,
  t,
  tDetail,
}: {
  isTenant: boolean;
  companyName?: string;
  from: string;
  to: string;
  days: number;
  isRangeBlocked: boolean;
  isAvailabilityPending: boolean;
  isAvailabilityError: boolean;
  bookingsEnabled: boolean;
  requestMode: boolean;
  t: ReturnType<typeof useTranslations>;
  tDetail: ReturnType<typeof useTranslations>;
}): string {
  if (!bookingsEnabled) {
    return t("sitePaused");
  }

  if (isTenant) {
    if (isAvailabilityPending) {
      return tDetail("checkingAvailability");
    }

    if (isAvailabilityError) {
      return tDetail("availabilityUnavailable");
    }

    if (!from || !to) {
      return t("selectDates");
    }

    if (isRangeBlocked || days <= 0) {
      return t("invalidDates");
    }

    return requestMode ? t("confirmRequest") : tDetail("bookNow");
  }

  if (companyName) {
    return tDetail("continueOnCompany", { company: companyName });
  }

  return tDetail("rentOnCompanySite");
}
