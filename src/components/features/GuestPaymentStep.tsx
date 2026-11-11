"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock3, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { GuestPaymentForm } from "./GuestPaymentForm";
import { useReservation } from "@/hooks/useReservation";
import {
  useCreateGuestPayment,
  useGuestPayment,
} from "@/hooks/useGuestPayment";
import { ApiError, getErrorKey } from "@/lib/errors";
import {
  canStartGuestPayment,
  formatCountdown,
  isManualCapture,
  isPaymentSettled,
  isPaymentWindowOpen,
  remainingPaymentMs,
  stripeRedirectPending,
} from "@/lib/guestPayment";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { GuestPayment } from "@/types/payment";
import type { GuestReservation } from "@/types/reservation";

interface GuestPaymentStepProps {
  token: string;
  reservation: GuestReservation;
  onSettled: () => void;
}

export function GuestPaymentStep({
  token,
  reservation,
  onSettled,
}: GuestPaymentStepProps) {
  const t = useTranslations("payment");
  const tRoot = useTranslations();
  const locale = useLocale();
  const { mutateAsync: createPayment, isPending: creating, isError: createFailed, error: createError } =
    useCreateGuestPayment(token);
  const startedRef = useRef(false);
  const [session, setSession] = useState<GuestPayment | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [awaitingWebhook, setAwaitingWebhook] = useState(() =>
    typeof window === "undefined"
      ? false
      : stripeRedirectPending(window.location.search),
  );
  const [now, setNow] = useState(() => Date.now());

  const paymentQuery = useGuestPayment(token, {
    enabled: awaitingWebhook || Boolean(session),
    poll: awaitingWebhook,
  });
  const reservationQuery = useReservation(token, { poll: awaitingWebhook });
  const liveReservation = reservationQuery.data ?? reservation;

  const expiresAt =
    paymentQuery.data?.expiresAt ??
    session?.expiresAt ??
    liveReservation.paymentExpiresAt;
  const windowOpen = isPaymentWindowOpen(expiresAt, now);
  const settled = isPaymentSettled(paymentQuery.data, liveReservation);
  const amount =
    session?.amount ??
    paymentQuery.data?.amount ??
    liveReservation.advanceDue;
  const currency =
    session?.currency ?? paymentQuery.data?.currency ?? liveReservation.currency;
  const captureMethodPayment = paymentQuery.data ?? session;

  const startSession = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    setFormError(null);
    try {
      const payment = await createPayment({
        successUrl: window.location.href,
        cancelUrl: window.location.href,
      });
      setSession(payment);
      if (isPaymentSettled(payment)) {
        setAwaitingWebhook(true);
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.code === "rental_payments.already_paid" ||
          error.code === "booking.payment_not_required")
      ) {
        setAwaitingWebhook(true);
        return;
      }

      setFormError(tRoot(getErrorKey(error)));
    }
  }, [createPayment, tRoot]);

  const settledRef = useRef(false);
  useEffect(() => {
    if (!settled || settledRef.current) {
      return;
    }

    settledRef.current = true;
    onSettled();
  }, [onSettled, settled]);

  useEffect(() => {
    if (
      startedRef.current ||
      session ||
      awaitingWebhook ||
      !canStartGuestPayment(reservation)
    ) {
      return;
    }

    startedRef.current = true;
    void startSession();
  }, [awaitingWebhook, reservation, session, startSession]);

  useEffect(() => {
    if (!expiresAt || settled) {
      return;
    }

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt, settled]);

  if (settled) {
    return null;
  }

  if (!windowOpen) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5">
        <ErrorState
          message={tRoot("errors.booking.payment_window_elapsed")}
        />
      </div>
    );
  }

  const remaining = remainingPaymentMs(expiresAt, now);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-md">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("amountDue", { amount: formatMoney(amount, currency, locale) })}
        </p>
      </div>

      {isManualCapture(captureMethodPayment) ? (
        <p className="rounded-lg bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
          {t("requestAuthorize")}
        </p>
      ) : remaining > 0 ? (
        <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <Clock3 size={16} className="text-primary" aria-hidden />
          {t("countdown", { time: formatCountdown(remaining) })}
        </p>
      ) : null}

      {awaitingWebhook ? (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-surface-muted/60 px-4 py-6 text-center">
          <p className="text-sm font-medium text-foreground">{t("confirming")}</p>
          <p className="text-sm text-muted-foreground">{t("confirmingHint")}</p>
        </div>
      ) : null}

      {formError ? (
        <p className="text-sm text-danger" role="alert">
          {formError}
        </p>
      ) : null}

      {creating && !session ? (
        <GuestPaymentStepSkeleton />
      ) : null}

      {createFailed && !session ? (
        <ErrorState
          message={formError ?? tRoot(getErrorKey(createError))}
          onRetry={() => {
            startedRef.current = true;
            void startSession();
          }}
        />
      ) : null}

      {session?.clientSecret &&
      session.publishableKey &&
      session.connectedAccountId &&
      !awaitingWebhook ? (
        <GuestPaymentForm
          payment={session}
          returnUrl={typeof window === "undefined" ? "" : window.location.href}
          guestEmail={liveReservation.guestEmail}
          guestName={liveReservation.guestName}
          payLabel={t("pay")}
          payingLabel={t("paying")}
          onSubmitted={() => {
            setFormError(null);
            setAwaitingWebhook(true);
          }}
          onError={(message) => {
            setFormError(message);
          }}
        />
      ) : null}

      {session && !session.clientSecret && !awaitingWebhook ? (
        <ErrorState
          message={tRoot("errors.booking.payment_not_open")}
          onRetry={() => {
            startedRef.current = true;
            void startSession();
          }}
        />
      ) : null}

      <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck size={14} className="text-primary" aria-hidden />
        {t("secure")}
      </p>
    </section>
  );
}

export function GuestPaymentStepSkeleton() {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5",
      )}
    >
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}

