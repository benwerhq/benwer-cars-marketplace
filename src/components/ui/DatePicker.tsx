"use client";

import * as Popover from "@radix-ui/react-popover";
import { format, isValid, parseISO, startOfMonth } from "date-fns";
import { enGB, es, pt } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState, type ChangeEvent, type CSSProperties } from "react";
import {
  DayPicker,
  getDefaultClassNames,
  type DropdownProps,
} from "react-day-picker";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import "react-day-picker/style.css";

export const DATE_WIRE_FORMAT = "yyyy-MM-dd";

const LOCALES = { "en-GB": enGB, "es-ES": es, "pt-PT": pt } as const;
const WEEK_STARTS_ON = { "en-GB": 1, "es-ES": 1, "pt-PT": 1 } as const;

type LocaleKey = keyof typeof LOCALES;

interface DatePickerProps {
  id?: string;
  /** ISO `yyyy-MM-dd`, or "" when unset. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  /**
   * Shows the month and year dropdowns in the caption so far-away dates (date
   * of birth, document expiry) are one click instead of months of paging.
   * Opt-in per screen while it is rolled out.
   */
  selectableMonthYear?: boolean;
  locale?: string;
  className?: string;
  "aria-invalid"?: boolean;
}

function parseDateValue(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

function defaultRangeStart(): Date {
  return startOfMonth(new Date(new Date().getFullYear() - 120, 0, 1));
}

function defaultRangeEnd(): Date {
  return startOfMonth(new Date(new Date().getFullYear() + 50, 11, 1));
}

function CalendarDropdown({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  disabled,
}: DropdownProps) {
  const handleValueChange = (next: string) => {
    onChange?.({
      target: { value: next },
    } as ChangeEvent<HTMLSelectElement>);
  };

  return (
    <Select
      value={value?.toString()}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-8 min-w-[4.75rem] gap-1 border-border-strong bg-surface px-2 font-medium shadow-none"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-56">
        {options?.map((option) => (
          <SelectItem
            key={option.value}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CalendarChevron({
  className,
  orientation,
  size = 16,
  disabled,
}: {
  className?: string;
  style?: CSSProperties;
  size?: number;
  disabled?: boolean;
  orientation?: "left" | "right" | "up" | "down";
}) {
  const iconClass = cn(
    "text-muted-foreground",
    disabled && "opacity-40",
    className,
  );
  if (orientation === "left") {
    return <ChevronLeft size={size} className={iconClass} />;
  }
  return <ChevronRight size={size} className={iconClass} />;
}

/**
 * Calendar date input. A text-like trigger that opens a month grid in a Radix
 * popover; reads/writes the ISO `yyyy-MM-dd` wire format. Use this instead of
 * `<input type="date">` so every date field shares one calendar, localisation
 * and token styling.
 */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder,
  clearable = false,
  disabled = false,
  fromDate,
  toDate,
  selectableMonthYear = false,
  locale = "en-GB",
  className,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const t = useTranslations("datePicker");
  const [open, setOpen] = useState(false);
  const localeKey: LocaleKey =
    locale in LOCALES ? (locale as LocaleKey) : "en-GB";
  const dfLocale = LOCALES[localeKey];
  const selected = parseDateValue(value);
  const [month, setMonth] = useState<Date>(() => selected ?? new Date());
  const [syncedValue, setSyncedValue] = useState(value);
  const defaultClassNames = getDefaultClassNames();

  // Follow an external value change (for example the return date jumping
  // forward when pickup changes). Month navigation must not snap back.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setMonth(selected ?? new Date());
  }

  const startMonth = useMemo(() => fromDate ?? defaultRangeStart(), [fromDate]);
  const endMonth = useMemo(() => toDate ?? defaultRangeEnd(), [toDate]);

  const display = selected
    ? format(selected, "d MMM yyyy", { locale: dfLocale })
    : "";

  return (
    // Modal popovers set pointer-events: none on the page, so Save never
    // receives the click that dismisses an open calendar.
    <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
      <Popover.Trigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          data-invalid={ariaInvalid ? "true" : undefined}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background hover:border-border-strong",
            display ? "text-foreground" : "text-subtle-foreground",
            disabled && "cursor-not-allowed opacity-60",
            className,
          )}
        >
          <span className="truncate">
            {display || placeholder || "\u00a0"}
          </span>
          {clearable && display && !disabled ? (
            <span
              role="button"
              aria-label={t("clear")}
              tabIndex={-1}
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
              }}
              className="rounded-sm p-0.5 text-subtle-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <X size={14} />
            </span>
          ) : (
            <CalendarIcon
              size={14}
              className="shrink-0 text-subtle-foreground"
            />
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="pointer-events-auto z-50 w-auto rounded-xl border border-border bg-surface p-3 shadow-xl focus:outline-none"
        >
          <DayPicker
            mode="single"
            selected={selected}
            month={month}
            onMonthChange={setMonth}
            captionLayout={selectableMonthYear ? "dropdown" : "label"}
            navLayout="after"
            startMonth={startMonth}
            endMonth={endMonth}
            showOutsideDays
            disabled={[
              ...(fromDate ? [{ before: fromDate }] : []),
              ...(toDate ? [{ after: toDate }] : []),
            ]}
            locale={dfLocale}
            weekStartsOn={WEEK_STARTS_ON[localeKey]}
            onSelect={(nextDate, triggerDate) => {
              onChange(format(nextDate ?? triggerDate, DATE_WIRE_FORMAT));
              setOpen(false);
            }}
            className="marketplace-day-picker [--cell-size:2.25rem]"
            classNames={{
              root: cn("w-fit", defaultClassNames.root),
              months: cn(
                "relative flex flex-col gap-3",
                defaultClassNames.months,
              ),
              month: cn("flex w-full flex-col gap-3", defaultClassNames.month),
              month_caption: cn(
                "relative flex h-9 w-full items-center justify-center",
                defaultClassNames.month_caption,
              ),
              caption_label: cn(
                "text-sm font-semibold text-foreground",
                defaultClassNames.caption_label,
              ),
              dropdowns: cn(
                "flex h-9 w-full items-center justify-center gap-1.5",
                defaultClassNames.dropdowns,
              ),
              dropdown_root: cn("relative", defaultClassNames.dropdown_root),
              dropdown: cn(
                "absolute inset-0 opacity-0",
                defaultClassNames.dropdown,
              ),
              // Click-through: the nav spans the caption row and would otherwise
              // swallow clicks on the month/year dropdowns underneath it.
              nav: cn(
                "pointer-events-none absolute inset-x-0 top-0 flex w-full items-center justify-between",
                defaultClassNames.nav,
              ),
              button_previous: cn(
                "pointer-events-auto inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
                defaultClassNames.button_previous,
              ),
              button_next: cn(
                "pointer-events-auto inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
                defaultClassNames.button_next,
              ),
              month_grid: cn(
                "w-full border-collapse",
                defaultClassNames.month_grid,
              ),
              weekdays: cn("flex", defaultClassNames.weekdays),
              weekday: cn(
                "flex-1 pb-1 text-center text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase",
                defaultClassNames.weekday,
              ),
              week: cn("mt-1 flex w-full", defaultClassNames.week),
              day: cn(
                "relative aspect-square h-full w-full p-0 text-center",
                defaultClassNames.day,
              ),
              day_button: cn(
                "inline-flex size-[var(--cell-size)] items-center justify-center rounded-lg text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary",
                defaultClassNames.day_button,
              ),
              selected: cn(
                "rounded-lg bg-primary text-primary-foreground",
                defaultClassNames.selected,
              ),
              today: cn(
                "rounded-lg bg-surface-muted font-semibold text-foreground aria-selected:bg-primary aria-selected:text-primary-foreground",
                defaultClassNames.today,
              ),
              outside: cn(
                "text-muted-foreground opacity-45 aria-selected:opacity-100",
                defaultClassNames.outside,
              ),
              disabled: cn(
                "text-muted-foreground opacity-40",
                defaultClassNames.disabled,
              ),
              hidden: cn("invisible", defaultClassNames.hidden),
            }}
            components={{
              Chevron: CalendarChevron,
              Dropdown: CalendarDropdown,
            }}
            formatters={{
              formatMonthDropdown: (date) =>
                format(date, "MMM", { locale: dfLocale }),
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
