"use client";

import { SearchParams } from "@/enums";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { BookingForm } from "./BookingForm";
import { BookingSummary } from "./BookingSummary";
import { PriceBreakdownList, PriceWarnings } from "./PriceBreakdownList";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCreateReservation } from "@/hooks/useCreateReservation";
import { useInsurancePackages } from "@/hooks/useInsurancePackages";
import { useGuestPrefill } from "@/hooks/useGuestAccount";
import { withReturnTo } from "@/lib/returnTo";
import { useOneWayFee } from "@/hooks/useOneWayFee";
import { usePriceQuote } from "@/hooks/usePriceQuote";
import type { SiteBranch } from "@/types/site";
import { buildBookHref } from "@/lib/booking";
import {
  bookingDraftKey,
  clearBookingDraft,
  readBookingDraft,
  writeBookingDraft,
} from "@/lib/bookingDraft";
import { localizedText } from "@/lib/localizedCopy";
import {
  createBookingSchema,
  type BookingFormValues,
} from "@/lib/bookingSchema";
import { sanitizeDateRange } from "@/lib/availability";
import { countRentalDays } from "@/lib/dates";
import { ApiError, applyFieldErrors, getErrorKey } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import { BookingMode, ErrorMessages, type PublicChannel } from "@/enums";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";
import type { Vehicle } from "@/types/vehicle";

const BOOKING_FORM_ID = "booking-form";

const RENTAL_LENGTH_ERRORS: Partial<Record<string, ErrorMessages>> = {
  "pricing.min_days": ErrorMessages.PRICING_MIN_DAYS,
  "pricing.max_days": ErrorMessages.PRICING_MAX_DAYS,
  "pricing.rental_too_long": ErrorMessages.PRICING_RENTAL_TOO_LONG,
  "reservation.min_lead": ErrorMessages.RESERVATION_MIN_LEAD,
};

interface BookingViewProps {
  vehicle: Vehicle;
  company?: Company | null;
  companySlug: string;
  defaultFrom?: string;
  defaultTo?: string;
  carHref: string;
  requireTerms?: boolean;
  bookingMode?: BookingMode;
  bookingsEnabled?: boolean;
  channel?: PublicChannel;
  showInsurance?: boolean;
  confirmationBaseUrl?: string;
  bookHrefBase?: string;
  returnLocation?: SiteBranch | null;
  /** Company-site sign-in page; shows the sign-in link when set. */
  guestSignInHref?: string;
}

function withBookingDates(base: string, from: string, to: string): string {
  const url = new URL(base, window.location.origin);
  for (const [key, value] of [
    [SearchParams.FROM, from],
    [SearchParams.TO, to],
  ] as const) {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  }
  return url.origin === window.location.origin
    ? `${url.pathname}${url.search}`
    : url.toString();
}

export function BookingView({
  vehicle,
  company,
  companySlug,
  defaultFrom = "",
  defaultTo = "",
  carHref,
  requireTerms = false,
  bookingMode = BookingMode.INSTANT,
  bookingsEnabled = true,
  channel,
  showInsurance = false,
  confirmationBaseUrl,
  bookHrefBase,
  returnLocation = null,
  guestSignInHref,
}: BookingViewProps) {
  const router = useRouter();
  const t = useTranslations("booking");
  const tRoot = useTranslations();
  const locale = useLocale();
  const initialRange = sanitizeDateRange(defaultFrom, defaultTo);
  const schema = useMemo(
    () =>
      createBookingSchema({
        nameMin: t("validation.nameMin"),
        email: t("validation.email"),
        phone: t("validation.phone"),
        startDate: t("validation.startDate"),
        endDate: t("validation.endDate"),
        endAfterStart: t("validation.endAfterStart"),
        terms: requireTerms ? t("validation.terms") : undefined,
      }, { website: Boolean(channel) }),
    [channel, requireTerms, t],
  );

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      startDate: initialRange.from,
      endDate: initialRange.to,
      acceptTerms: false,
    },
  });

  const startDate =
    useWatch({ control: form.control, name: "startDate" }) ?? initialRange.from;
  const endDate =
    useWatch({ control: form.control, name: "endDate" }) ?? initialRange.to;
  const days = countRentalDays(startDate, endDate);
  const quoteQuery = usePriceQuote(companySlug, {
    vehicleId: vehicle.id,
    startDate: days > 0 ? startDate : "",
    endDate: days > 0 ? endDate : "",
    channel,
  });
  const insuranceQuery = useInsurancePackages(
    showInsurance ? companySlug : "",
    {
      vehicleId: vehicle.id,
      startDate: days > 0 ? startDate : "",
      endDate: days > 0 ? endDate : "",
      channel,
    },
  );
  const draftKey = bookingDraftKey(companySlug, vehicle.id);
  // The insurance list only renders after a client fetch, so reading the
  // draft here cannot cause a hydration mismatch.
  const [insurancePackageId, setInsurancePackageId] = useState(
    () => readBookingDraft(draftKey)?.insurancePackageId ?? "",
  );
  const selectedInsurance = insurancePackageId
    ? (insuranceQuery.data ?? []).find((pack) => pack.packageId === insurancePackageId)
    : undefined;
  const insuranceTotal = selectedInsurance?.total ?? 0;

  // Keep what the guest typed across Change dates, back, refresh and a
  // language switch. Dates in the URL win over the saved draft.
  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    const draft = readBookingDraft(draftKey);
    if (draft) {
      const fill = { shouldDirty: true } as const;
      if (draft.guestName) form.setValue("guestName", draft.guestName, fill);
      if (draft.guestEmail) form.setValue("guestEmail", draft.guestEmail, fill);
      if (draft.guestPhone) form.setValue("guestPhone", draft.guestPhone, fill);
      if (draft.acceptTerms) form.setValue("acceptTerms", true, fill);
      if (!initialRange.from && !initialRange.to) {
        const saved = sanitizeDateRange(draft.startDate ?? "", draft.endDate ?? "");
        if (saved.from) form.setValue("startDate", saved.from, fill);
        if (saved.to) form.setValue("endDate", saved.to, fill);
      }
    }
    // Restore once per car; the URL dates are read at mount on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // Prefill from the signed-in guest. Only empty fields are filled, so what
  // the guest typed (or restored from the draft) is never overwritten.
  const prefill = useGuestPrefill(companySlug);
  useEffect(() => {
    if (!prefill.signedIn) {
      return;
    }
    const fill = { shouldDirty: true } as const;
    const fields = [
      ["guestEmail", prefill.email],
      ["guestName", prefill.fullName],
      ["guestPhone", prefill.phone],
    ] as const;
    for (const [field, value] of fields) {
      if (value && !form.getValues(field)) {
        form.setValue(field, value, fill);
      }
    }
  }, [form, prefill.email, prefill.fullName, prefill.phone, prefill.signedIn]);

  // Runs after the restore effect above, which has already read the draft.
  useEffect(() => {
    writeBookingDraft(draftKey, {
      guestName: watchedValues.guestName,
      guestEmail: watchedValues.guestEmail,
      guestPhone: watchedValues.guestPhone,
      acceptTerms: watchedValues.acceptTerms,
      startDate: watchedValues.startDate,
      endDate: watchedValues.endDate,
      insurancePackageId,
    });
  }, [draftKey, insurancePackageId, watchedValues]);
  const oneWayFeeQuery = useOneWayFee(companySlug, {
    vehicleId: vehicle.id,
    startDate: days > 0 ? startDate : "",
    endDate: days > 0 ? endDate : "",
    returnBranchId: returnLocation?.id ?? "",
    channel,
  });
  const oneWayFee = returnLocation ? (oneWayFeeQuery.data ?? null) : null;
  const quote =
    days > 0 && quoteQuery.data?.totalDays === days ? quoteQuery.data : null;
  const lengthBlocked = (quote?.warnings.length ?? 0) > 0;
  const total =
    days > 0
      ? formatMoney(
          (quote?.vehicleSubtotal ?? days * vehicle.pricePerDay) +
            (oneWayFee ?? 0) +
            insuranceTotal,
          vehicle.currency,
          locale,
        )
      : null;
  const dailyRate = formatMoney(vehicle.pricePerDay, vehicle.currency, locale);

  useEffect(() => {
    const nextHref = bookHrefBase
      ? withBookingDates(bookHrefBase, startDate, endDate)
      : buildBookHref({
          companySlug,
          carId: vehicle.id,
          from: startDate,
          to: endDate,
        });
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== nextHref) {
      router.replace(nextHref, { scroll: false });
    }
  }, [bookHrefBase, companySlug, endDate, router, startDate, vehicle.id]);

  const { mutateAsync, isPending } = useCreateReservation({
    companySlug,
    onSuccess: (reservation) => {
      clearBookingDraft(draftKey);
      router.push(
        confirmationBaseUrl
          ? `${confirmationBaseUrl.replace(/\/$/, "")}/${encodeURIComponent(reservation.token)}`
          : `/booking/${reservation.token}`,
      );
    },
  });

  const isBusy = isPending || form.formState.isSubmitting;

  async function onSubmit(values: BookingFormValues) {
    if (isPending || lengthBlocked) {
      return;
    }

    try {
      await mutateAsync({
        vehicleId: vehicle.id,
        startDate: values.startDate,
        endDate: values.endDate,
        guestName: values.guestName,
        guestEmail: values.guestEmail,
        guestPhone: values.guestPhone,
        insurancePackageId: insurancePackageId || undefined,
        returnBranchId: returnLocation?.id,
        channel,
        acceptTerms: channel ? values.acceptTerms : undefined,
      });
    } catch (error) {
      if (
        mapReservationErrors(
          error,
          (field, fieldError) => {
            form.setError(field, fieldError);
          },
          tRoot,
        )
      ) {
        toast.error(tRoot(getErrorKey(error)));
        return;
      }
      toast.error(tRoot(getErrorKey(error)));
    }
  }

  function onInvalid() {
    toast.error(t("validation.fixErrors"));
  }

  const carName = `${vehicle.brand} ${vehicle.model}`;

  // Shown inside the form, above the terms checkbox, so the guest picks
  // cover before accepting the terms.
  const insuranceSection =
    showInsurance && insuranceQuery.data && insuranceQuery.data.length > 0 ? (
      <fieldset className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
        <legend className="px-1 text-sm font-medium text-foreground">
          {t("insurance")}
        </legend>
        {insuranceQuery.data.map((pack) => {
          const name =
            localizedText(pack.name, locale) || pack.code || pack.packageId;
          return (
            <label
              key={pack.packageId}
              className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-surface-hover"
            >
              <input
                type="radio"
                name="insurancePackageId"
                value={pack.packageId}
                checked={insurancePackageId === pack.packageId}
                onChange={() => setInsurancePackageId(pack.packageId)}
                className="mt-1"
              />
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-medium text-foreground">
                  {name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatMoney(pack.total, vehicle.currency, locale)}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>
    ) : null;

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-6">
        <Link
          href={carHref}
          className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft size={16} aria-hidden />
          {t("backToCar", { name: carName })}
        </Link>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {prefill.signedIn ? t("subtitleSignedIn") : t("subtitle")}
          </p>
        </div>

        {prefill.available && prefill.ready ? (
          prefill.signedIn ? (
            <p className="text-sm text-muted-foreground">
              {t("signedInAs", { email: prefill.email })}
            </p>
          ) : guestSignInHref ? (
            <p className="text-sm text-muted-foreground">
              {t("signInPrompt")}{" "}
              <Link
                href={guestSignInHref}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
                    return;
                  }
                  event.preventDefault();
                  router.push(
                    withReturnTo(
                      guestSignInHref,
                      `${window.location.pathname}${window.location.search}`,
                    ),
                  );
                }}
                className="font-medium text-primary hover:text-primary-hover"
              >
                {t("signInLink")}
              </Link>
            </p>
          ) : null
        ) : null}

        <ul className="flex flex-wrap gap-2">
          {prefill.signedIn ? null : (
            <TrustPill icon={ShieldCheck} label={t("trustNoAccount")} />
          )}
          <TrustPill icon={Mail} label={t("trustEmail")} />
          <TrustPill
            icon={Wallet}
            label={channel ? t("trustPaymentAfter") : t("trustNoPayment")}
          />
        </ul>

        {days <= 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface-muted/60 px-4 py-3 lg:hidden">
            <p className="text-sm font-medium text-foreground">
              {t("datesMissingTitle")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("datesMissingDescription")}
            </p>
            <Link
              href={carHref}
              className="mt-2 inline-block cursor-pointer text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t("pickDates")}
            </Link>
          </div>
        ) : null}

        {quote ? (
          <div className="flex flex-col gap-3 lg:hidden">
            {quote.segments.length > 0 ? (
              <PriceBreakdownList
                breakdown={quote}
                currency={vehicle.currency}
                className="rounded-xl border border-border bg-surface px-4 py-3"
              />
            ) : null}
            <PriceWarnings warnings={quote.warnings} />
          </div>
        ) : null}

        <form
          id={BOOKING_FORM_ID}
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="grid grid-cols-1 gap-8 lg:grid-cols-5"
          noValidate
          aria-label={t("formAria")}
          aria-busy={isBusy}
        >
          <div className="lg:col-span-3">
            {bookingsEnabled ? (
              <BookingForm
                carHref={carHref}
                requireTerms={requireTerms}
                beforeTerms={insuranceSection}
              />
            ) : (
              <p className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted-foreground">
                {t("sitePaused")}
              </p>
            )}

            <p className="mt-4 hidden text-xs text-muted-foreground lg:block">
              {t("trustFooter")}
            </p>
          </div>

          <div className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-20 flex flex-col gap-4">
              <BookingSummary
                vehicle={vehicle}
                company={company}
                from={startDate}
                to={endDate}
                carHref={carHref}
                quote={quote}
                returnLocationName={returnLocation?.name}
                oneWayFee={oneWayFee}
                extraLines={
                  selectedInsurance
                    ? [
                        {
                          key: "insurance",
                          label:
                            localizedText(selectedInsurance.name, locale) ||
                            selectedInsurance.code ||
                            t("insurance"),
                          amount: insuranceTotal,
                        },
                      ]
                    : []
                }
              />
              <ConfirmButton
                isBusy={isBusy}
                blocked={lengthBlocked}
                confirmingLabel={
                  bookingMode === BookingMode.REQUEST
                    ? t("requesting")
                    : t("confirming")
                }
                confirmLabel={
                  bookingMode === BookingMode.REQUEST
                    ? t("confirmRequest")
                    : t("confirm")
                }
                disabled={!bookingsEnabled}
              />
            </div>
          </div>
        </form>
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
              {total ?? dailyRate}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {days > 0
                ? t("stickyMeta", { name: carName, count: days })
                : t("selectDates")}
            </p>
          </div>
          <ConfirmButton
            isBusy={isBusy}
            blocked={lengthBlocked}
            confirmingLabel={
              bookingMode === BookingMode.REQUEST
                ? t("requesting")
                : t("confirming")
            }
            confirmLabel={
              bookingMode === BookingMode.REQUEST
                ? t("confirmRequest")
                : t("confirm")
            }
            form={BOOKING_FORM_ID}
            className="w-auto min-w-36"
            disabled={!bookingsEnabled}
          />
        </div>
      </div>
    </FormProvider>
  );
}

function ConfirmButton({
  isBusy,
  blocked = false,
  confirmingLabel,
  confirmLabel,
  form,
  className,
  disabled = false,
}: {
  isBusy: boolean;
  blocked?: boolean;
  confirmingLabel: string;
  confirmLabel: string;
  form?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="submit"
      form={form}
      size="lg"
      isLoading={isBusy}
      disabled={isBusy || blocked || disabled}
      className={cn("h-11 w-full", className)}
    >
      {isBusy ? confirmingLabel : confirmLabel}
    </Button>
  );
}

function TrustPill({
  icon: Icon,
  label,
}: {
  icon: typeof ShieldCheck;
  label: string;
}) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-muted-foreground">
      <Icon size={14} aria-hidden className="text-primary" />
      {label}
    </li>
  );
}

function mapReservationErrors(
  error: unknown,
  setError: (
    field: keyof BookingFormValues,
    error: { message: string },
  ) => void,
  translate: (key: ErrorMessages) => string,
): boolean {
  if (applyFieldErrors(error, setError, translate)) {
    return true;
  }

  if (error instanceof ApiError && error.code === "reservation.overlap") {
    const message = translate(ErrorMessages.RESERVATION_OVERLAP);
    setError("startDate", { message });
    setError("endDate", { message });
    return true;
  }

  const lengthError =
    error instanceof ApiError ? RENTAL_LENGTH_ERRORS[error.code] : undefined;
  if (lengthError) {
    setError("endDate", { message: translate(lengthError) });
    return true;
  }

  return false;
}

export function BookingViewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-4 w-40" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-7 w-32 rounded-full" />
        <Skeleton className="h-7 w-40 rounded-full" />
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 lg:col-span-3">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
          <Skeleton className="h-5 w-36" />
          <div className="flex gap-3">
            <Skeleton className="h-16 w-24 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}
