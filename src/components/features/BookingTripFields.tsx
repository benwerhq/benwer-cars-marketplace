"use client";

import { useLocale, useTranslations } from "next-intl";
import { DatePicker } from "@/components/ui/DatePicker";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { TIME_SLOTS } from "@/lib/extras";

export interface BookingTripDetails {
  pickupTime: string;
  returnTime: string;
  flightNumber: string;
  notes: string;
  dateOfBirth: string;
}

export const EMPTY_TRIP_DETAILS: BookingTripDetails = {
  pickupTime: "",
  returnTime: "",
  flightNumber: "",
  notes: "",
  dateOfBirth: "",
};

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function BookingTripFields({
  value,
  onChange,
  airport,
  dateOfBirthFallback = "",
}: {
  value: BookingTripDetails;
  onChange: (patch: Partial<BookingTripDetails>) => void;
  /** The pick-up branch is an airport: ask for the flight up front. */
  airport: boolean;
  /** From the guest's profile when they haven't typed one. */
  dateOfBirthFallback?: string;
}) {
  const t = useTranslations("booking");
  const locale = useLocale();

  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <legend className="px-1 text-sm font-medium text-foreground">{t("tripDetails")}</legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t("pickupTime")} htmlFor="pickupTime">
          <select
            id="pickupTime"
            value={value.pickupTime}
            onChange={(event) => onChange({ pickupTime: event.target.value })}
            className={SELECT_CLASS}
          >
            <option value="">{t("timeAny")}</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("returnTime")} htmlFor="returnTime">
          <select
            id="returnTime"
            value={value.returnTime}
            onChange={(event) => onChange({ returnTime: event.target.value })}
            className={SELECT_CLASS}
          >
            <option value="">{t("timeAny")}</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field
        label={airport ? t("flightNumber") : `${t("flightNumber")} (${t("optional")})`}
        htmlFor="flightNumber"
        hint={airport ? t("flightNumberHint") : t("flightNumberOptional")}
      >
        <Input
          id="flightNumber"
          type="text"
          autoComplete="off"
          maxLength={12}
          placeholder="FR1234"
          value={value.flightNumber}
          onChange={(event) =>
            onChange({ flightNumber: event.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, "") })
          }
          className="h-11"
        />
      </Field>
      <Field label={`${t("dateOfBirth")} (${t("optional")})`} htmlFor="dateOfBirth">
        <DatePicker
          id="dateOfBirth"
          value={value.dateOfBirth || dateOfBirthFallback}
          onChange={(dateOfBirth) => onChange({ dateOfBirth })}
          fromDate={new Date(1920, 0, 1)}
          toDate={new Date()}
          selectableMonthYear
          clearable
          locale={locale}
          className="h-11"
        />
      </Field>
      <Field label={`${t("notes")} (${t("optional")})`} htmlFor="bookingNotes">
        <textarea
          id="bookingNotes"
          rows={3}
          maxLength={1000}
          placeholder={t("notesPlaceholder")}
          value={value.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>
    </fieldset>
  );
}
