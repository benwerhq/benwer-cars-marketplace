import { AlertTriangle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { parseIsoDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type {
  PriceBreakdown,
  PriceSegment,
  PriceWarning,
} from "@/types/pricing";

function seasonLabel(
  names: Record<string, string>,
  locale: string,
): string | undefined {
  return (
    names[locale] ??
    names[locale.slice(0, 2)] ??
    Object.values(names).find((name) => name.trim() !== "")
  );
}

function formatShortDay(value: string, locale: string): string {
  const date = parseIsoDate(value);
  return date
    ? date.toLocaleDateString(locale, { day: "numeric", month: "short" })
    : value;
}

function SegmentRow({
  segment,
  currency,
}: {
  segment: PriceSegment;
  currency: string;
}) {
  const t = useTranslations("booking");
  const locale = useLocale();
  const label =
    (segment.seasonName ? seasonLabel(segment.seasonName, locale) : undefined) ??
    t("standardRate");
  const range =
    segment.startDate === segment.endDate
      ? formatShortDay(segment.startDate, locale)
      : `${formatShortDay(segment.startDate, locale)} – ${formatShortDay(segment.endDate, locale)}`;

  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-foreground">
          {label}
          {segment.weekend ? (
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
              {t("weekendRate")}
            </span>
          ) : null}
        </span>
        <span className="text-xs text-muted-foreground">
          {t("segmentDetail", {
            range,
            days: t("nights", { count: segment.days }),
            rate: formatMoney(segment.dailyRate, currency, locale),
          })}
        </span>
      </div>
      <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
        {formatMoney(segment.subtotal, currency, locale)}
      </span>
    </li>
  );
}

export function PriceWarnings({
  warnings,
  className,
}: {
  warnings: PriceWarning[];
  className?: string;
}) {
  const t = useTranslations("booking");

  if (warnings.length === 0) {
    return null;
  }

  return (
    <ul className={cn("flex flex-col gap-2", className)} role="alert">
      {warnings.map((warning) => (
        <li
          key={`${warning.code}-${warning.seasonId}`}
          className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-sm text-warning"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
          {warning.code === "pricing.min_days"
            ? t("warningMinDays", { limit: warning.limit })
            : t("warningMaxDays", { limit: warning.limit })}
        </li>
      ))}
    </ul>
  );
}

export function PriceBreakdownList({
  breakdown,
  currency,
  className,
}: {
  breakdown: PriceBreakdown;
  currency: string;
  className?: string;
}) {
  const t = useTranslations("booking");

  return (
    <section className={cn("flex flex-col gap-1", className)}>
      <h3 className="text-sm font-semibold text-foreground">
        {t("breakdownTitle")}
      </h3>
      <ul className="divide-y divide-border">
        {breakdown.segments.map((segment) => (
          <SegmentRow
            key={`${segment.startDate}-${segment.seasonId ?? "standard"}-${segment.weekend ? "weekend" : "weekday"}`}
            segment={segment}
            currency={currency}
          />
        ))}
      </ul>
    </section>
  );
}
