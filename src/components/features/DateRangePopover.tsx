"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { DayPicker, type DateRange } from "react-day-picker";
import { enGB, es, pt } from "react-day-picker/locale";
import { SearchFieldSegment } from "./SearchFieldSegment";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  formatSearchDate,
  parseIsoDate,
  startOfToday,
  toIsoDate,
} from "@/lib/dates";
import { cn } from "@/lib/utils";
import "react-day-picker/style.css";

interface DateRangePopoverProps {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
  invalid?: boolean;
  required?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  describedBy?: string;
}

function SearchFieldDivider() {
  return (
    <div
      aria-hidden
      className="bg-border h-px w-full md:mx-0 md:my-2 md:h-auto md:w-px md:self-stretch"
    />
  );
}

export function DateRangePopover({
  from,
  to,
  onChange,
  invalid = false,
  required = false,
  open,
  onOpenChange,
  describedBy,
}: DateRangePopoverProps) {
  const t = useTranslations("search");
  const locale = useLocale();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [activeField, setActiveField] = useState<"from" | "to">("from");
  const isOpen = open ?? uncontrolledOpen;

  function setOpen(next: boolean) {
    if (open === undefined) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  }

  const fromDate = parseIsoDate(from);
  const toDate = parseIsoDate(to);
  const today = startOfToday();
  const selected: DateRange | undefined =
    fromDate || toDate
      ? { from: fromDate ?? undefined, to: toDate ?? undefined }
      : undefined;

  const fromValue = fromDate
    ? formatSearchDate(fromDate, locale)
    : t("pickupPlaceholder");
  const toValue = toDate
    ? formatSearchDate(toDate, locale)
    : t("dropoffPlaceholder");

  function handleSelect(range: DateRange | undefined) {
    if (!range?.from) {
      onChange({ from: "", to: "" });
      return;
    }

    const nextFrom = toIsoDate(range.from);
    const nextTo =
      range.to && range.to >= range.from ? toIsoDate(range.to) : "";
    onChange({ from: nextFrom, to: nextTo });
    setActiveField(nextTo ? "from" : "to");

    if (nextFrom && nextTo) {
      setOpen(false);
    }
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-stretch">
          <div className="min-w-0 md:flex-1">
            <SearchFieldSegment
              icon={<Calendar size={16} aria-hidden />}
              label={t("pickupLabel")}
              value={fromValue}
              isPlaceholder={!fromDate}
              isActive={isOpen && activeField === "from"}
              tone={invalid && !fromDate ? "warning" : "default"}
              aria-expanded={isOpen}
              aria-haspopup="dialog"
              aria-invalid={invalid && !fromDate}
              aria-required={required || undefined}
              aria-describedby={describedBy}
              aria-label={t("pickupTrigger", { date: fromValue })}
              onClick={() => {
                setActiveField("from");
                setOpen(true);
              }}
            />
          </div>
          <SearchFieldDivider />
          <div className="min-w-0 md:flex-1">
            <SearchFieldSegment
              icon={<Calendar size={16} aria-hidden />}
              label={t("dropoffLabel")}
              value={toValue}
              isPlaceholder={!toDate}
              isActive={isOpen && activeField === "to"}
              tone={invalid && !toDate ? "warning" : "default"}
              aria-expanded={isOpen}
              aria-haspopup="dialog"
              aria-invalid={invalid && !toDate}
              aria-required={required || undefined}
              aria-describedby={describedBy}
              aria-label={t("dropoffTrigger", { date: toValue })}
              onClick={() => {
                setActiveField(fromDate ? "to" : "from");
                setOpen(true);
              }}
            />
          </div>
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className={cn(
            "z-50 rounded-xl border border-border bg-surface p-3 shadow-md outline-none",
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
            aria-label={t("calendarLabel")}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
