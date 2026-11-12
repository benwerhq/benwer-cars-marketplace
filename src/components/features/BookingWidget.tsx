"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { buildBookHref } from "@/lib/booking";
import { addToCart, CART_MAX_ITEMS } from "@/lib/cart";
import { buildCompanySiteHref } from "@/lib/companySite";
import { countRentalDays, formatLongDate, parseIsoDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { SITE_CHANNEL } from "@/lib/site";
import { usePriceQuote } from "@/hooks/usePriceQuote";
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
  cart?: CarCartContext | null;
}

/** What the car page knows to put a car in the company site's cart. */
export interface CarCartContext {
  slug: string;
  href: string;
  branch?: string;
  returnBranch?: string;
  driverAge?: string;
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
  cart = null,
}: BookingWidgetProps) {
  const t = useTranslations("booking");
  const tCart = useTranslations("cart");
  const router = useRouter();
  const tCars = useTranslations("cars");
  const tDetail = useTranslations("carDetail");
  const locale = useLocale();

  const days = countRentalDays(from, to);
  const canBook =
    days > 0 &&
    !isRangeBlocked &&
    !isAvailabilityPending &&
    !isAvailabilityError;
  // Checkout charges the rate-table quote, so the widget shows the same figures.
  const quoteQuery = usePriceQuote(companySlug, {
    vehicleId: vehicle.id,
    startDate: days > 0 ? from : "",
    endDate: days > 0 ? to : "",
    channel: isTenant ? SITE_CHANNEL : undefined,
  });
  const quote =
    days > 0 && !quoteQuery.isPlaceholderData ? quoteQuery.data : undefined;
  const dailyRate = quote?.averageDailyRate ?? vehicle.pricePerDay;
  const total = canBook
    ? (quote?.vehicleSubtotal ?? days * vehicle.pricePerDay)
    : null;
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
  const canAddToCart = Boolean(cart) && isTenant && bookingsEnabled && canBook;

  function handleAddToCart() {
    if (!cart || !canAddToCart) {
      return;
    }
    const added = addToCart(cart.slug, {
      vehicleId: vehicle.id,
      from,
      to,
      branch: cart.branch,
      returnBranch: cart.returnBranch,
      driverAge: cart.driverAge,
    });
    if (!added) {
      toast.error(tCart("full", { max: CART_MAX_ITEMS }));
      return;
    }
    toast.success(tCart("added"), {
      action: { label: tCart("view"), onClick: () => router.push(cart.href) },
    });
  }

  const priceFormatted = formatMoney(
    dailyRate,
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
        {cart && isTenant && bookingsEnabled ? (
          <Button
            type="button"
            variant="secondary"
            disabled={!canAddToCart}
            onClick={handleAddToCart}
            className="hidden h-11 w-full lg:inline-flex"
          >
            <ShoppingCart size={16} aria-hidden />
            {tCart("add")}
          </Button>
        ) : null}
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
          {cart && isTenant && bookingsEnabled ? (
            <Button
              type="button"
              variant="secondary"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
              aria-label={tCart("add")}
              className="h-11 w-11 shrink-0 px-0"
            >
              <ShoppingCart size={18} aria-hidden />
            </Button>
          ) : null}
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
