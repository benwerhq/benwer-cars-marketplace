"use client";

import Link from "next/link";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { BookingDateFields } from "./BookingDateFields";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { BookingFormValues } from "@/lib/bookingSchema";

interface BookingFormProps {
  carHref: string;
  requireTerms?: boolean;
}

export function BookingForm({ carHref, requireTerms = false }: BookingFormProps) {
  const t = useTranslations("booking");
  const {
    register,
    formState: { errors },
  } = useFormContext<BookingFormValues>();

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5 shadow-sm md:p-6">
      <BookingDateFields />
      <Link
        href={carHref}
        className="w-fit cursor-pointer text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {t("changeDates")}
      </Link>

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
        error={errors.guestPhone?.message}
        required
      >
        <Input
          id="guestPhone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder={t("guestPhonePlaceholder")}
          className="h-11"
          {...register("guestPhone")}
        />
      </Field>

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
