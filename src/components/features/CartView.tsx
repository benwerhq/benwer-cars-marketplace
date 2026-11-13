"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Info, ShoppingCart, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { BookingVehiclePreview } from "./BookingVehiclePreview";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { DatePicker } from "@/components/ui/DatePicker";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAvailability } from "@/hooks/useAvailability";
import { useCreateReservation } from "@/hooks/useCreateReservation";
import { useGuestPrefill } from "@/hooks/useGuestAccount";
import { useInsurancePackages } from "@/hooks/useInsurancePackages";
import { useOneWayFee } from "@/hooks/useOneWayFee";
import { usePriceQuote } from "@/hooks/usePriceQuote";
import { useVehicle } from "@/hooks/useVehicle";
import { rangeIncludesUnavailable, unavailableDatesForVehicle } from "@/lib/availability";
import { setHrefParams } from "@/lib/booking";
import {
  bookingDraftKey,
  readBookingDraft,
  writeBookingDraft,
} from "@/lib/bookingDraft";
import { createGuestDetailsSchema, type GuestDetailsValues } from "@/lib/bookingSchema";
import { removeFromCart, updateCartItem, useCart, type CartItem } from "@/lib/cart";
import { countRentalDays, formatLongDate, parseIsoDate, startOfToday, toIsoDate } from "@/lib/dates";
import { getErrorKey } from "@/lib/errors";
import { localizedText } from "@/lib/localizedCopy";
import { guestBookingFieldsEnabled, TIME_SLOTS } from "@/lib/extras";
import { formatMoney } from "@/lib/money";
import { withReturnTo } from "@/lib/returnTo";
import { SearchParams, type PublicChannel } from "@/enums";
import type { SiteBranch } from "@/types/site";

interface CartViewProps {
  cartSlug: string;
  companySlug: string;
  branches: SiteBranch[];
  allowDifferentReturn: boolean;
  channel: PublicChannel;
  fleetHref: string;
  carHrefTemplate: string;
  bookHrefTemplate: string;
  guestSignInHref: string;
  confirmationBaseUrl: string;
}

/** What each cart line knows once its live checks finish. */
interface ItemState {
  ready: boolean;
  bookable: boolean;
  total: number;
  currency: string;
  label: string;
}

interface CheckoutResult {
  itemId: string;
  label: string;
  token?: string;
  error?: string;
}

function cartDate(iso: string, locale: string): string {
  const date = parseIsoDate(iso);
  return date ? formatLongDate(date, locale) : iso;
}

function fillTemplate(template: string, carId: string): string {
  return template.replace("__car__", encodeURIComponent(carId));
}

export function CartView({
  cartSlug,
  companySlug,
  branches,
  allowDifferentReturn,
  channel,
  fleetHref,
  carHrefTemplate,
  bookHrefTemplate,
  guestSignInHref,
  confirmationBaseUrl,
}: CartViewProps) {
  const t = useTranslations("cart");
  const tBooking = useTranslations("booking");
  const tRoot = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const items = useCart(cartSlug);
  const [states, setStates] = useState<Record<string, ItemState>>({});
  const [results, setResults] = useState<CheckoutResult[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const reportState = useCallback((id: string, state: ItemState) => {
    setStates((current) => {
      const prev = current[id];
      if (
        prev &&
        prev.ready === state.ready &&
        prev.bookable === state.bookable &&
        prev.total === state.total &&
        prev.currency === state.currency &&
        prev.label === state.label
      ) {
        return current;
      }
      return { ...current, [id]: state };
    });
  }, []);

  const schema = useMemo(
    () =>
      createGuestDetailsSchema({
        nameMin: tBooking("validation.nameMin"),
        email: tBooking("validation.email"),
        phone: tBooking("validation.phone"),
        terms: tBooking("validation.terms"),
      }),
    [tBooking],
  );
  const form = useForm<GuestDetailsValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { guestName: "", guestEmail: "", guestPhone: "", acceptTerms: false },
  });

  // Keep the driver details while the guest edits the cart or reloads.
  const draftKey = bookingDraftKey(companySlug, "cart");
  const watched = useWatch({ control: form.control });
  useEffect(() => {
    const draft = readBookingDraft(draftKey);
    if (draft?.guestName) form.setValue("guestName", draft.guestName);
    if (draft?.guestEmail) form.setValue("guestEmail", draft.guestEmail);
    if (draft?.guestPhone) form.setValue("guestPhone", draft.guestPhone);
  }, [draftKey, form]);
  useEffect(() => {
    writeBookingDraft(draftKey, {
      guestName: watched.guestName,
      guestEmail: watched.guestEmail,
      guestPhone: watched.guestPhone,
    });
  }, [draftKey, watched]);

  const prefill = useGuestPrefill(companySlug);
  useEffect(() => {
    if (!prefill.signedIn) {
      return;
    }
    const fields = [
      ["guestEmail", prefill.email],
      ["guestName", prefill.fullName],
      ["guestPhone", prefill.phone],
    ] as const;
    for (const [field, value] of fields) {
      if (value && !form.getValues(field)) {
        form.setValue(field, value, { shouldDirty: true });
      }
    }
  }, [form, prefill.email, prefill.fullName, prefill.phone, prefill.signedIn]);

  const liveStates = items.map((item) => states[item.id]);
  const allReady = liveStates.every((state) => state?.ready);
  const allBookable = liveStates.every((state) => state?.bookable);
  const grandTotal = liveStates.reduce((sum, state) => sum + (state?.total ?? 0), 0);
  const currency = liveStates.find((state) => state?.currency)?.currency ?? "EUR";

  const createReservation = useCreateReservation({ companySlug });

  async function onSubmit(values: GuestDetailsValues) {
    if (submitting || items.length === 0) {
      return;
    }
    if (!allReady || !allBookable) {
      toast.error(t("fixItems"));
      return;
    }
    setSubmitting(true);
    const next: CheckoutResult[] = [];
    const booked: string[] = [];
    // One booking per car, one after another, so a failure on one car
    // doesn't stop the rest and each result is clear.
    for (const item of items) {
      const label = states[item.id]?.label ?? item.vehicleId;
      try {
        const reservation = await createReservation.mutateAsync({
          vehicleId: item.vehicleId,
          startDate: item.from,
          endDate: item.to,
          guestName: values.guestName,
          guestEmail: values.guestEmail,
          guestPhone: values.guestPhone,
          insurancePackageId: item.insurancePackageId || undefined,
          addonIds: item.addonIds?.length ? item.addonIds : undefined,
          ...(guestBookingFieldsEnabled()
            ? {
                pickupTime: item.pickupTime || undefined,
                returnTime: item.returnTime || undefined,
              }
            : {}),
          returnBranchId: allowDifferentReturn ? item.returnBranch || undefined : undefined,
          channel,
          acceptTerms: values.acceptTerms,
        });
        booked.push(item.id);
        next.push({ itemId: item.id, label, token: reservation.token });
      } catch (error) {
        next.push({ itemId: item.id, label, error: tRoot(getErrorKey(error)) });
      }
    }
    removeFromCart(cartSlug, booked);
    setResults(next);
    setSubmitting(false);
    if (booked.length === next.length) {
      toast.success(t("allBooked"));
    } else {
      toast.error(t("partial"));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {results.length > 0 ? (
        <section
          aria-live="polite"
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
        >
          <h2 className="text-base font-semibold text-foreground">{t("resultsTitle")}</h2>
          <ul className="flex flex-col gap-2">
            {results.map((result) => (
              <li key={result.itemId} className="flex items-start gap-3 text-sm">
                {result.token ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" aria-hidden />
                ) : (
                  <XCircle size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden />
                )}
                <div className="flex min-w-0 flex-col">
                  <span className="font-medium text-foreground">
                    {result.label} - {result.token ? t("resultBooked") : t("resultFailed")}
                  </span>
                  {result.token ? (
                    <a
                      href={`${confirmationBaseUrl}/${encodeURIComponent(result.token)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-fit text-primary hover:text-primary-hover"
                    >
                      {t("viewBooking")}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{result.error}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={40} />}
          title={t("empty")}
          description={t("emptyHint")}
          actionLabel={t("browse")}
          actionHref={fleetHref}
        />
      ) : (
        <>
          <p className="flex items-start gap-2 rounded-xl border border-border bg-surface-muted/60 px-4 py-3 text-sm text-muted-foreground">
            <Info size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden />
            {t("notHeld")}
          </p>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <ul className="flex flex-col gap-4 lg:col-span-3">
              {items.map((item) => (
                <CartLine
                  key={item.id}
                  item={item}
                  cartSlug={cartSlug}
                  companySlug={companySlug}
                  channel={channel}
                  branches={branches}
                  allowDifferentReturn={allowDifferentReturn}
                  carHref={setHrefParams(fillTemplate(carHrefTemplate, item.vehicleId), {
                    [SearchParams.FROM]: item.from,
                    [SearchParams.TO]: item.to,
                  })}
                  bookHref={setHrefParams(fillTemplate(bookHrefTemplate, item.vehicleId), {
                    [SearchParams.FROM]: item.from,
                    [SearchParams.TO]: item.to,
                    [SearchParams.BRANCH]: item.branch,
                    [SearchParams.RETURN_BRANCH]: item.returnBranch,
                    [SearchParams.DRIVER_AGE]: item.driverAge,
                  })}
                  onState={reportState}
                />
              ))}
            </ul>

            <FormProvider {...form}>
              <form
                noValidate
                onSubmit={form.handleSubmit(onSubmit, () => toast.error(tBooking("validation.fixErrors")))}
                className="flex flex-col gap-4 self-start rounded-2xl border border-border bg-surface p-5 shadow-md lg:sticky lg:top-20 lg:col-span-2"
                aria-label={t("checkoutTitle")}
              >
                <div>
                  <h2 className="text-base font-semibold text-foreground">{t("checkoutTitle")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{t("checkoutHint")}</p>
                </div>
                {prefill.available && prefill.ready ? (
                  prefill.signedIn ? (
                    <p className="text-sm text-muted-foreground">
                      {tBooking("signedInAs", { email: prefill.email })}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {tBooking("signInPrompt")}{" "}
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
                        {tBooking("signInLink")}
                      </Link>
                    </p>
                  )
                ) : null}
                <GuestDetailsFields />
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm font-medium text-foreground">
                    {t("total", { count: items.length })}
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-foreground">
                    {allReady ? formatMoney(grandTotal, currency, locale) : "..."}
                  </span>
                </div>
                {allReady && !allBookable ? (
                  <p className="text-sm text-danger" role="alert">
                    {t("fixItems")}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  size="lg"
                  isLoading={submitting}
                  disabled={submitting || !allReady || !allBookable}
                  className="h-11 w-full"
                >
                  {submitting ? t("booking") : t("bookAll", { count: items.length })}
                </Button>
              </form>
            </FormProvider>
          </div>
        </>
      )}
    </div>
  );
}

function GuestDetailsFields() {
  const t = useTranslations("booking");
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<GuestDetailsValues>();

  return (
    <>
      <Field label={t("guestName")} htmlFor="cartGuestName" error={errors.guestName?.message} required>
        <Input
          id="cartGuestName"
          type="text"
          autoComplete="name"
          placeholder={t("guestNamePlaceholder")}
          className="h-11"
          {...register("guestName")}
        />
      </Field>
      <Field
        label={t("guestEmail")}
        htmlFor="cartGuestEmail"
        hint={t("guestEmailHint")}
        error={errors.guestEmail?.message}
        required
      >
        <Input
          id="cartGuestEmail"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          placeholder={t("guestEmailPlaceholder")}
          className="h-11"
          {...register("guestEmail")}
        />
      </Field>
      <Field
        label={t("guestPhone")}
        htmlFor="cartGuestPhone"
        hint={t("guestPhoneHint")}
        required
      >
        <Controller
          name="guestPhone"
          control={control}
          render={({ field }) => (
            <PhoneInput
              id="cartGuestPhone"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              error={errors.guestPhone?.message}
              required
            />
          )}
        />
      </Field>
      <Field label={t("termsLabel")} htmlFor="cartAcceptTerms" error={errors.acceptTerms?.message} required>
        <label htmlFor="cartAcceptTerms" className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
          <input
            id="cartAcceptTerms"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border-strong text-primary focus-visible:ring-2 focus-visible:ring-ring"
            {...register("acceptTerms")}
          />
          <span>
            {t("termsAccept")}{" "}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:text-primary-hover"
            >
              {t("termsLink")}
            </Link>
          </span>
        </label>
      </Field>
    </>
  );
}

interface CartLineProps {
  item: CartItem;
  cartSlug: string;
  companySlug: string;
  channel: PublicChannel;
  branches: SiteBranch[];
  allowDifferentReturn: boolean;
  carHref: string;
  bookHref: string;
  onState: (id: string, state: ItemState) => void;
}

/**
 * One car in the cart. Re-checks availability and price live, so what the
 * guest sees is what checkout will try to book.
 */
function CartLine({
  item,
  cartSlug,
  companySlug,
  channel,
  branches,
  allowDifferentReturn,
  carHref,
  bookHref,
  onState,
}: CartLineProps) {
  const t = useTranslations("cart");
  const tBooking = useTranslations("booking");
  const locale = useLocale();
  const [editing, setEditing] = useState(false);
  const days = countRentalDays(item.from, item.to);
  const datesValid = days > 0 && item.from >= toIsoDate(startOfToday());
  const range = {
    vehicleId: item.vehicleId,
    startDate: datesValid ? item.from : "",
    endDate: datesValid ? item.to : "",
    channel,
  };

  const vehicleQuery = useVehicle(companySlug, item.vehicleId, channel);
  const availabilityQuery = useAvailability(
    companySlug,
    { from: item.from, to: item.to, vehicleId: item.vehicleId, channel },
    datesValid,
  );
  const quoteQuery = usePriceQuote(companySlug, range);
  const insuranceQuery = useInsurancePackages(companySlug, range);
  const returnBranch = allowDifferentReturn
    ? branches.find((branch) => branch.id === item.returnBranch) ?? null
    : null;
  const oneWayFeeQuery = useOneWayFee(companySlug, {
    ...range,
    returnBranchId: returnBranch?.id ?? "",
  });

  const vehicle = vehicleQuery.data;
  const unavailable =
    availabilityQuery.data !== undefined &&
    rangeIncludesUnavailable(
      item.from,
      item.to,
      unavailableDatesForVehicle(availabilityQuery.data, item.vehicleId),
    );
  const quote = quoteQuery.data?.totalDays === days ? quoteQuery.data : null;
  const lengthBlocked = (quote?.warnings.length ?? 0) > 0;
  const insurance = item.insurancePackageId
    ? insuranceQuery.data?.find((pack) => pack.packageId === item.insurancePackageId)
    : undefined;
  const oneWayFee = returnBranch ? (oneWayFeeQuery.data ?? 0) : 0;
  const vehicleSubtotal = quote?.vehicleSubtotal ?? (vehicle ? days * vehicle.pricePerDay : 0);
  const total = vehicleSubtotal + (insurance?.total ?? 0) + oneWayFee;
  const currency = vehicle?.currency ?? "EUR";
  const label = vehicle ? `${vehicle.brand} ${vehicle.model}` : item.vehicleId;

  const ready =
    !vehicleQuery.isPending &&
    (!datesValid || (!availabilityQuery.isPending && !quoteQuery.isPending)) &&
    (!item.insurancePackageId || !insuranceQuery.isPending);
  const bookable =
    Boolean(vehicle) &&
    datesValid &&
    !unavailable &&
    !availabilityQuery.isError &&
    !lengthBlocked;

  useEffect(() => {
    onState(item.id, { ready, bookable, total, currency, label });
  }, [bookable, currency, item.id, label, onState, ready, total]);

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      {vehicle ? (
        <Link href={carHref} className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <BookingVehiclePreview vehicle={vehicle} size="md" />
        </Link>
      ) : vehicleQuery.isPending ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <p className="text-sm text-danger">{t("vehicleMissing")}</p>
      )}

      {editing ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("from")} htmlFor={`from-${item.id}`}>
            <DatePicker
              id={`from-${item.id}`}
              fromDate={startOfToday()}
              value={item.from}
              onChange={(from) => updateCartItem(cartSlug, item.id, { from })}
              locale={locale}
              className="h-11"
            />
          </Field>
          <Field label={t("to")} htmlFor={`to-${item.id}`}>
            <DatePicker
              id={`to-${item.id}`}
              fromDate={item.from ? parseIsoDate(item.from) ?? startOfToday() : startOfToday()}
              value={item.to}
              onChange={(to) => updateCartItem(cartSlug, item.id, { to })}
              locale={locale}
              className="h-11"
            />
          </Field>
          {guestBookingFieldsEnabled() ? (
            <>
              <Field label={tBooking("pickupTime")} htmlFor={`pickupTime-${item.id}`}>
                <select
                  id={`pickupTime-${item.id}`}
                  value={item.pickupTime ?? ""}
                  onChange={(event) =>
                    updateCartItem(cartSlug, item.id, { pickupTime: event.target.value || undefined })
                  }
                  className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
                >
                  <option value="">{tBooking("timeAny")}</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={tBooking("returnTime")} htmlFor={`returnTime-${item.id}`}>
                <select
                  id={`returnTime-${item.id}`}
                  value={item.returnTime ?? ""}
                  onChange={(event) =>
                    updateCartItem(cartSlug, item.id, { returnTime: event.target.value || undefined })
                  }
                  className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
                >
                  <option value="">{tBooking("timeAny")}</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : null}
          {insuranceQuery.data && insuranceQuery.data.length > 0 ? (
            <Field label={t("insurance")} htmlFor={`insurance-${item.id}`} className="sm:col-span-2">
              <select
                id={`insurance-${item.id}`}
                value={item.insurancePackageId ?? ""}
                onChange={(event) =>
                  updateCartItem(cartSlug, item.id, {
                    insurancePackageId: event.target.value || undefined,
                  })
                }
                className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
              >
                <option value="">{t("noInsurance")}</option>
                {insuranceQuery.data.map((pack) => (
                  <option key={pack.packageId} value={pack.packageId}>
                    {(localizedText(pack.name, locale) || pack.code || pack.packageId) +
                      " - " +
                      formatMoney(pack.total, currency, locale)}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-muted-foreground">{t("from")}</dt>
          <dd className="text-right font-medium text-foreground">{cartDate(item.from, locale)}</dd>
          <dt className="text-muted-foreground">{t("to")}</dt>
          <dd className="text-right font-medium text-foreground">{cartDate(item.to, locale)}</dd>
          {returnBranch ? (
            <>
              <dt className="text-muted-foreground">{tBooking("returnLocation")}</dt>
              <dd className="text-right font-medium text-foreground">{returnBranch.name}</dd>
            </>
          ) : null}
          {insurance ? (
            <>
              <dt className="text-muted-foreground">
                {localizedText(insurance.name, locale) || insurance.code || t("insurance")}
              </dt>
              <dd className="text-right font-medium tabular-nums text-foreground">
                {formatMoney(insurance.total, currency, locale)}
              </dd>
            </>
          ) : null}
          {oneWayFee > 0 ? (
            <>
              <dt className="text-muted-foreground">{t("oneWayFee")}</dt>
              <dd className="text-right font-medium tabular-nums text-foreground">
                {formatMoney(oneWayFee, currency, locale)}
              </dd>
            </>
          ) : null}
        </dl>
      )}

      {!datesValid ? (
        <p className="text-sm text-danger" role="alert">{t("invalidDates")}</p>
      ) : availabilityQuery.isPending ? (
        <p className="text-sm text-muted-foreground">{t("checking")}</p>
      ) : unavailable ? (
        <p className="text-sm text-danger" role="alert">{t("unavailable")}</p>
      ) : lengthBlocked ? (
        <p className="text-sm text-danger" role="alert">{t("invalidDates")}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-sm text-muted-foreground">
          {days > 0 ? tBooking("nights", { count: days }) : null}
        </span>
        <span className="text-base font-semibold tabular-nums text-foreground">
          {vehicle && datesValid ? formatMoney(total, currency, locale) : null}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => setEditing((value) => !value)}>
          {editing ? t("done") : t("edit")}
        </Button>
        <Link
          href={bookHref}
          className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-primary hover:text-primary-hover"
        >
          {t("bookOnly")}
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeFromCart(cartSlug, item.id)}
          className="ml-auto"
        >
          <Trash2 size={15} aria-hidden />
          {t("remove")}
        </Button>
      </div>
    </li>
  );
}

