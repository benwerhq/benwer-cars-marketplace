"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { useLocale, useTranslations } from "next-intl";
import { useReservation } from "@/hooks/useReservation";
import { useWithdrawReservation } from "@/hooks/useWithdrawReservation";
import { ApiError, getErrorKey } from "@/lib/errors";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookingVehiclePreview } from "./BookingVehiclePreview";
import { GuestCancellationPanel } from "./GuestCancellationPanel";
import { PriceBreakdownList } from "./PriceBreakdownList";
import {
  NavRoutes,
  PaymentStatus,
  ReservationStatus as ReservationStatusEnum,
} from "@/enums";
import { countRentalDays, formatLongDate, parseIsoDate } from "@/lib/dates";
import {
  canSelfServeCancel,
  canStartGuestPayment,
  canWithdrawReservation,
  needsOnlinePayment,
} from "@/lib/guestPayment";
import { formatMoney } from "@/lib/money";
import { localizedText } from "@/lib/localizedCopy";
import { cn } from "@/lib/utils";

const GuestPaymentStep = dynamic(
  () =>
    import("./GuestPaymentStep").then((mod) => mod.GuestPaymentStep),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    ),
  },
);

interface ReservationStatusProps {
  token: string;
  browseHref?: string | null;
  allowWithdraw?: boolean;
}

const KNOWN_CANCEL_REASONS = [
  "unpaid_timeout",
  "request_expired",
  "request_declined",
  "customer_request",
] as const;

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
  allowWithdraw = true,
}: ReservationStatusProps) {
  const t = useTranslations("reservationStatus");
  const tRoot = useTranslations();
  const tBooking = useTranslations("booking");
  const locale = useLocale();
  const { data, isPending, isError, error, refetch } = useReservation(token, {
    poll: true,
  });
  const withdraw = useWithdrawReservation(token);

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
          {data.guestPhone ? (
            <StatusRow label={t("phone")} value={data.guestPhone} />
          ) : null}
          {data.requestExpiresAt ? (
            <StatusRow
              label={t("requestExpires")}
              value={
                parseIsoDate(data.requestExpiresAt.slice(0, 10))
                  ? formatLongDate(
                      parseIsoDate(data.requestExpiresAt.slice(0, 10)) as Date,
                      locale,
                    )
                  : data.requestExpiresAt
              }
            />
          ) : null}
          {data.cancelReason ? (
            <StatusRow
              label={t("cancelReason")}
              value={
                KNOWN_CANCEL_REASONS.includes(
                  data.cancelReason as (typeof KNOWN_CANCEL_REASONS)[number],
                )
                  ? t(`reasons.${data.cancelReason}`)
                  : data.cancelReason
              }
            />
          ) : null}
          <StatusRow
            label={t("paymentStatus")}
            value={t(`payment.${data.paymentStatus}`)}
          />
          {data.paidAmount > 0 ? (
            <StatusRow
              label={t("paidAmount")}
              value={formatMoney(data.paidAmount, data.currency, locale)}
            />
          ) : null}
        </dl>

        {data.priceBreakdown && data.priceBreakdown.segments.length > 0 ? (
          <PriceBreakdownList
            breakdown={data.priceBreakdown}
            currency={data.currency}
            className="border-t border-border pt-4"
          />
        ) : null}

        {data.insurance ? (
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              {localizedText(data.insurance.name, locale) ||
                data.insurance.code ||
                t("insurance")}
            </span>
            <span className="font-medium tabular-nums text-foreground">
              {formatMoney(data.insurance.total, data.currency, locale)}
            </span>
          </div>
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

      {canStartGuestPayment(data) ? (
        <GuestPaymentStep
          token={token}
          reservation={data}
          onSettled={() => {
            void refetch();
          }}
        />
      ) : needsOnlinePayment(data) ? (
        <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
          {tRoot("errors.booking.payment_window_elapsed")}
        </p>
      ) : data.paymentStatus === PaymentStatus.PAID ||
        data.advanceAuthorized ? (
        <p className="inline-flex items-center justify-center">
          <Badge variant="success" dot>
            {data.advanceAuthorized && data.paymentStatus !== PaymentStatus.PAID
              ? t("payment.authorized")
              : t("payment.paid")}
          </Badge>
        </p>
      ) : null}

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
        {allowWithdraw && canWithdrawReservation(data) ? (
          <Button
            variant="danger"
            isLoading={withdraw.isPending}
            onClick={() => {
              void withdraw.mutateAsync().catch((withdrawError) => {
                toast.error(tRoot(getErrorKey(withdrawError)));
              });
            }}
          >
            {t("withdraw")}
          </Button>
        ) : null}
        {canSelfServeCancel(data) ? (
          <GuestCancellationPanel token={token} />
        ) : null}
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
