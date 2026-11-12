"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { DayPicker, type DateRange } from "react-day-picker";
import { enGB, es, pt } from "react-day-picker/locale";
import { Field } from "@/components/ui/Field";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { BookingFormValues } from "@/lib/bookingSchema";
import {
  formatLongDate,
  parseIsoDate,
  startOfToday,
  toIsoDate,
} from "@/lib/dates";
import { cn } from "@/lib/utils";
import "react-day-picker/style.css";

export function BookingDateFields() {
  const t = useTranslations("booking");
  const locale = useLocale();
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<BookingFormValues>();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);

  const startDate = watch("startDate") ?? "";
  const endDate = watch("endDate") ?? "";
  const fromDate = parseIsoDate(startDate);
  const toDate = parseIsoDate(endDate);
  const today = startOfToday();
  const selected: DateRange | undefined =
    fromDate || toDate
      ? { from: fromDate ?? undefined, to: toDate ?? undefined }
      : undefined;

  function handleSelect(range: DateRange | undefined) {
    if (!range?.from) {
      setValue("startDate", "", { shouldValidate: true, shouldDirty: true });
      setValue("endDate", "", { shouldValidate: true, shouldDirty: true });
      return;
    }

    const nextFrom = toIsoDate(range.from);
    const nextTo =
      range.to && range.to >= range.from ? toIsoDate(range.to) : "";
    setValue("startDate", nextFrom, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("endDate", nextTo, { shouldValidate: true, shouldDirty: true });

    if (nextFrom && nextTo) {
      setOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{t("datesHint")}</p>
      <Popover.Root open={open} onOpenChange={setOpen}>
        {/* The popover needs an anchor: without one Radix places the
            calendar at the top-left of the page, off-screen. */}
        <Popover.Anchor asChild>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label={t("startDate")}
            htmlFor="startDate"
            error={errors.startDate?.message}
            required
          >
            <DateTrigger
              id="startDate"
              open={open}
              placeholder={t("addDate")}
              value={fromDate ? formatLongDate(fromDate, locale) : ""}
              ariaLabel={
                fromDate ? formatLongDate(fromDate, locale) : t("selectDates")
              }
              onClick={() => setOpen(true)}
            />
          </Field>
          <Field
            label={t("endDate")}
            htmlFor="endDate"
            error={errors.endDate?.message}
            required
          >
            <DateTrigger
              id="endDate"
              open={open}
              placeholder={t("addDate")}
              value={toDate ? formatLongDate(toDate, locale) : ""}
              ariaLabel={
                toDate ? formatLongDate(toDate, locale) : t("selectDates")
              }
              onClick={() => setOpen(true)}
            />
          </Field>
        </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            align="start"
            side="bottom"
            sideOffset={8}
            collisionPadding={16}
            avoidCollisions
            className={cn(
              "z-[60] max-h-[var(--radix-popover-content-available-height)] overflow-auto rounded-xl border border-border bg-surface p-3 shadow-md outline-none",
              "w-[min(100vw-1.5rem,20rem)] md:w-[min(100vw-1.5rem,42rem)]",
            )}
          >
            <DayPicker
              mode="range"
              locale={locale === "es-ES" ? es : locale === "pt-PT" ? pt : enGB}
              numberOfMonths={isDesktop ? 2 : 1}
              selected={selected}
              onSelect={handleSelect}
              disabled={{ before: today }}
              startMonth={today}
              resetOnSelect
              className="marketplace-day-picker"
              aria-label={t("changeDates")}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

function DateTrigger({
  id,
  open,
  value,
  placeholder,
  ariaLabel,
  onClick,
  ...props
}: {
  id: string;
  open: boolean;
  value: string;
  placeholder: string;
  ariaLabel: string;
  onClick: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      id={id}
      type="button"
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-label={ariaLabel}
      onClick={onClick}
      {...props}
      className={cn(
        "flex h-11 w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-3 text-left text-sm transition-colors",
        "hover:bg-surface-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        open && "ring-2 ring-ring",
      )}
    >
      <Calendar
        size={16}
        className="shrink-0 text-muted-foreground"
        aria-hidden
      />
      <span
        className={cn(
          "truncate",
          value ? "text-foreground" : "text-subtle-foreground",
        )}
      >
        {value || placeholder}
      </span>
    </button>
  );
}
