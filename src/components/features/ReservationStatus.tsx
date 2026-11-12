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
import { ReservationCarImage } from "./ReservationCarImage";
import { ReservationTrip } from "./ReservationTrip";
import { GuestCancellationPanel } from "./GuestCancellationPanel";
import { PriceBreakdownList } from "./PriceBreakdownList";
import {
  NavRoutes,
  PaymentStatus,
  ReservationStatus as ReservationStatusEnum,
} from "@/enums";
import { formatLongDate, parseIsoDate } from "@/lib/dates";
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
  companySlug?: string;
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
  companySlug,
  browseHref,
  allowWithdraw = true,
}: ReservationStatusProps) {
  const t = useTranslations("reservationStatus");
  const tRoot = useTranslations();
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

  const vehicleName = data.vehicle
    ? `${data.vehicle.brand} ${data.vehicle.model}`.trim()
    : t("vehicle");
  const vehicleMeta = [
    data.vehicle && data.vehicle.year > 0 ? String(data.vehicle.year) : null,
    companyName,
  ]
    .filter(Boolean)
    .join(" · ");
  const cancelReason = data.cancelReason
    ? KNOWN_CANCEL_REASONS.includes(
        data.cancelReason as (typeof KNOWN_CANCEL_REASONS)[number],
      )
      ? t(`reasons.${data.cancelReason}`)
      : data.cancelReason
    : null;
  const requestExpires = data.requestExpiresAt
    ? parseIsoDate(data.requestExpiresAt.slice(0, 10))
    : null;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
              isSuccess
                ? "bg-success-soft text-success"
                : "bg-surface-muted text-muted-foreground",
            )}
          >
            <CheckCircle2 size={24} aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {isSuccess ? t("successTitle") : t("title")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("successSubtitle", { email: data.guestEmail })}
            </p>
          </div>
        </div>
        <div className="flex flex-col rounded-xl border border-dashed border-border-strong bg-surface px-4 py-2.5 sm:items-end sm:text-right">
          <span className="text-xs text-muted-foreground">{t("reference")}</span>
          <span className="font-mono text-lg font-semibold tracking-widest text-foreground">
            {data.token.slice(0, 8).toUpperCase()}
          </span>
          <span className="text-xs text-subtle-foreground">{t("referenceHint")}</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm lg:col-start-1 lg:row-start-1">
            <div className="relative">
              <ReservationCarImage
                companySlug={data.companySlug || companySlug || ""}
                vehicleId={data.vehicleId}
                fallback={data.vehicle ?? null}
                alt={vehicleName}
                sizes="(min-width: 1024px) 640px, 100vw"
                priority
                className="aspect-[16/9] w-full sm:aspect-[2/1]"
              />
              <StatusBadge
                status={data.status}
                label={t(`status.${statusKey}`)}
                className="absolute top-4 left-4 shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-5 p-5 md:p-6">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold text-foreground">
                  {vehicleName}
                </h2>
                {vehicleMeta ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">{vehicleMeta}</p>
                ) : null}
              </div>
              <ReservationTrip
                startDate={data.startDate}
                endDate={data.endDate}
                pickupTime={data.pickupTime}
                returnTime={data.returnTime}
                size="md"
              />
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-border pt-5 sm:grid-cols-2">
                <StatusRow label={t("guest")} value={data.guestName} />
                <StatusRow label={t("email")} value={data.guestEmail} />
                {data.guestPhone ? (
                  <StatusRow label={t("phone")} value={data.guestPhone} />
                ) : null}
                {companyName ? (
                  <StatusRow label={t("company")} value={companyName} />
                ) : null}
                {requestExpires ? (
                  <StatusRow
                    label={t("requestExpires")}
                    value={formatLongDate(requestExpires, locale)}
                  />
                ) : null}
                {cancelReason ? (
                  <StatusRow label={t("cancelReason")} value={cancelReason} />
                ) : null}
              </dl>
            </div>
          </article>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-foreground">{t("priceTitle")}</h2>
              <Badge
                variant={
                  data.paymentStatus === PaymentStatus.PAID || data.advanceAuthorized
                    ? "success"
                    : "default"
                }
                dot
              >
                {data.advanceAuthorized && data.paymentStatus !== PaymentStatus.PAID
                  ? t("payment.authorized")
                  : t(`payment.${data.paymentStatus}`)}
              </Badge>
            </div>
            {data.priceBreakdown && data.priceBreakdown.segments.length > 0 ? (
              <PriceBreakdownList breakdown={data.priceBreakdown} currency={data.currency} />
            ) : null}
            {data.insurance ? (
              <PriceRow
                label={
                  localizedText(data.insurance.name, locale) ||
                  data.insurance.code ||
                  t("insurance")
                }
                value={formatMoney(data.insurance.total, data.currency, locale)}
              />
            ) : null}
            {data.extrasTotal ? (
              <PriceRow
                label={t("extras")}
                value={formatMoney(data.extrasTotal, data.currency, locale)}
              />
            ) : null}
            {data.feesTotal ? (
              <PriceRow
                label={t("fees")}
                value={formatMoney(data.feesTotal, data.currency, locale)}
              />
            ) : null}
            <div className="flex items-baseline justify-between border-t border-border pt-4">
              <span className="text-sm font-medium text-foreground">{t("total")}</span>
              <span className="text-2xl font-semibold tabular-nums text-foreground">{total}</span>
            </div>
            {data.paidAmount > 0 ? (
              <PriceRow
                label={t("paidAmount")}
                value={formatMoney(data.paidAmount, data.currency, locale)}
              />
            ) : null}
          </section>

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
          ) : null}

          <div className="flex flex-col gap-3">
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
            {canSelfServeCancel(data) ? <GuestCancellationPanel token={token} /> : null}
            <Link
              href={fleetHref}
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t("browseMore")}
            </Link>
          </div>
        </aside>

        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-muted/60 p-5 lg:col-start-1">
          <h2 className="text-sm font-semibold text-foreground">{t("nextTitle")}</h2>
          <ol className="flex flex-col gap-3">
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <Mail size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <span>{t("nextEmail", { email: data.guestEmail })}</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-muted-foreground">
              <CalendarDays size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <span>{t("nextPickup")}</span>
            </li>
          </ol>
          <p className="text-xs text-subtle-foreground">{t("trustCopy")}</p>
        </section>
      </div>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums text-foreground">{value}</span>
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
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <Skeleton className="h-20 w-40 rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <Skeleton className="aspect-[16/9] w-full rounded-none sm:aspect-[2/1]" />
          <div className="flex flex-col gap-5 p-5 md:p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  );
}
