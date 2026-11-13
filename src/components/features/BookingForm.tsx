"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { BookingDateFields } from "./BookingDateFields";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import type { BookingFormValues } from "@/lib/bookingSchema";

interface BookingFormProps {
  requireTerms?: boolean;
  /** Rendered after the driver details and before the terms checkbox. */
  beforeTerms?: ReactNode;
}

export function BookingForm({
  requireTerms = false,
  beforeTerms,
}: BookingFormProps) {
  const t = useTranslations("booking");
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<BookingFormValues>();

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5 shadow-sm md:p-6">
      <BookingDateFields />

      <div>
        <h2 className="text-xl font-semibold text-foreground">
          {t("details")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("detailsHint")}</p>
      </div>

      <Field
        label={t("guestName")}
        htmlFor="guestName"
        error={errors.guestName?.message}
        required
      >
        <Input
          id="guestName"
          type="text"
          autoComplete="name"
          placeholder={t("guestNamePlaceholder")}
          className="h-11"
          {...register("guestName")}
        />
      </Field>

      <Field
        label={t("guestEmail")}
        htmlFor="guestEmail"
        hint={t("guestEmailHint")}
        error={errors.guestEmail?.message}
        required
      >
        <Input
          id="guestEmail"
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
        htmlFor="guestPhone"
        hint={t("guestPhoneHint")}
        required
      >
        <Controller
          name="guestPhone"
          control={control}
          render={({ field }) => (
            <PhoneInput
              id="guestPhone"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              error={errors.guestPhone?.message}
              required
            />
          )}
        />
      </Field>

      {beforeTerms}

      {requireTerms ? (
        <Field
          label={t("termsLabel")}
          htmlFor="acceptTerms"
          error={errors.acceptTerms?.message}
          required
        >
          <label
            htmlFor="acceptTerms"
            className="flex cursor-pointer items-start gap-3 text-sm text-foreground"
          >
            <input
              id="acceptTerms"
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
      ) : null}
    </div>
  );
}
