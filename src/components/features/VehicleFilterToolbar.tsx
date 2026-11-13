"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpDown, ChevronDown, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { MultiSelectFilter } from "@/components/ui/MultiSelectFilter";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { Skeleton } from "@/components/ui/Skeleton";
import type { VehicleSort } from "@/enums";
import {
  FILTER_CATEGORIES,
  FILTER_FUELS,
  FILTER_SORTS,
  FILTER_TRANSMISSIONS,
  clearAdvancedFilters,
  hasActiveAdvancedFilters,
  seatOptionsOf,
} from "@/lib/vehicleFilters";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";
import type { Vehicle, VehicleFilters } from "@/types/vehicle";

const SEARCH_DEBOUNCE_MS = 300;

interface VehicleFilterToolbarProps {
  filters: VehicleFilters;
  onChange: (filters: VehicleFilters) => void;
  vehicles?: Vehicle[];
  companies?: Company[];
  className?: string;
}

export function VehicleFilterToolbar({
  filters,
  onChange,
  vehicles = [],
  companies,
  className,
}: VehicleFilterToolbarProps) {
  const t = useTranslations("cars");
  const seatOptions = seatOptionsOf(vehicles);
  const hasFilters = hasActiveAdvancedFilters(filters);
  const latest = useRef({ filters, onChange });
  const [draft, setDraft] = useState(filters.q ?? "");
  const [syncedQ, setSyncedQ] = useState(filters.q ?? "");
  const [sentQ, setSentQ] = useState(filters.q ?? "");
  const currentQ = filters.q ?? "";

  if (currentQ !== syncedQ) {
    setSyncedQ(currentQ);
    if (currentQ !== sentQ) {
      setSentQ(currentQ);
      setDraft(currentQ);
    }
  }

  useEffect(() => {
    latest.current = { filters, onChange };
  });

  useEffect(() => {
    const next = draft.trim();
    if (next === (latest.current.filters.q ?? "").trim()) {
      return;
    }
    const timer = window.setTimeout(() => {
      setSentQ(next);
      latest.current.onChange({
        ...latest.current.filters,
        q: next || undefined,
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draft]);

  return (
    <div
      role="search"
      aria-label={t("filters.title")}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-2",
        className,
      )}
    >
      <div className="relative w-full min-w-0 sm:w-auto sm:min-w-56 sm:flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-subtle-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="h-11 w-full rounded-full border border-border-strong bg-background pr-3 pl-9 text-sm text-foreground placeholder:text-subtle-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:h-9"
        />
      </div>
      <MultiSelectFilter
        label={t("filters.category")}
        options={FILTER_CATEGORIES.map((category) => ({
          value: category,
          label: t(`categories.${category}`),
        }))}
        value={filters.categories ?? []}
        onChange={(categories) =>
          onChange({
            ...filters,
            categories: categories.length ? categories : undefined,
          })
        }
      />
      <MultiSelectFilter
        label={t("filters.fuel")}
        options={FILTER_FUELS.map((fuel) => ({
          value: fuel,
          label: t(`fuel.${fuel}`),
        }))}
        value={filters.fuels ?? []}
        onChange={(fuels) =>
          onChange({ ...filters, fuels: fuels.length ? fuels : undefined })
        }
      />
      <MultiSelectFilter
        label={t("filters.transmission")}
        options={FILTER_TRANSMISSIONS.map((transmission) => ({
          value: transmission,
          label: t(`transmission.${transmission}`),
        }))}
        value={filters.transmissions ?? []}
        onChange={(transmissions) =>
          onChange({
            ...filters,
            transmissions: transmissions.length ? transmissions : undefined,
          })
        }
      />
      {seatOptions.length > 0 ? (
        <MultiSelectFilter
          label={t("filters.seats")}
          options={seatOptions.map((seats) => ({
            value: String(seats),
            label: String(seats),
          }))}
          value={(filters.seats ?? []).map(String)}
          onChange={(values) =>
            onChange({
              ...filters,
              seats: values.length
                ? values.map(Number).sort((a, b) => a - b)
                : undefined,
            })
          }
        />
      ) : null}
      {companies && companies.length > 1 ? (
        <MultiSelectFilter
          label={t("filters.company")}
          options={companies.map((company) => ({
            value: company.slug,
            label: company.name,
          }))}
          value={filters.companySlugs ?? []}
          onChange={(companySlugs) =>
            onChange({
              ...filters,
              companySlugs: companySlugs.length ? companySlugs : undefined,
              companySlug: companySlugs[0],
            })
          }
        />
      ) : null}
      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(clearAdvancedFilters(filters))}
          className="min-h-11 rounded-full md:min-h-9"
        >
          <X size={14} aria-hidden />
          {t("clearFilters")}
        </Button>
      ) : null}
    </div>
  );
}

interface VehicleResultsBarProps {
  filters: VehicleFilters;
  onChange: (filters: VehicleFilters) => void;
  summary: ReactNode;
  className?: string;
}

export function VehicleResultsBar({
  filters,
  onChange,
  summary,
  className,
}: VehicleResultsBarProps) {
  const t = useTranslations("cars");
  const sortOptions = [
    { value: "", label: t("sort.recommended") },
    ...FILTER_SORTS.map((sort) => ({
      value: sort,
      label: t(`sort.${sort.replace(":", "_")}`),
    })),
  ];
  const sortLabel =
    sortOptions.find((option) => option.value === (filters.sort ?? ""))
      ?.label ?? t("sort.recommended");

  return (
    <div
      className={cn(
        "flex min-h-10 flex-wrap items-center justify-between gap-x-4 gap-y-2",
        className,
      )}
    >
      <div className="flex min-w-0 items-center">{summary}</div>
      <SelectMenu
        value={filters.sort ?? ""}
        onValueChange={(value) =>
          onChange({
            ...filters,
            sort: (value || undefined) as VehicleSort | undefined,
          })
        }
        options={sortOptions}
        ariaLabel={t("sort.label")}
        align="end"
        triggerClassName="group inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-sm text-foreground transition-colors hover:bg-surface-hover md:h-9"
        contentClassName="w-[min(100vw-2rem,16rem)]"
      >
        <ArrowUpDown
          size={15}
          className="shrink-0 text-muted-foreground"
          aria-hidden
        />
        <span className="text-muted-foreground">{t("sort.label")}:</span>
        <span className="truncate font-medium">{sortLabel}</span>
        <ChevronDown
          size={14}
          className="ml-auto shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </SelectMenu>
    </div>
  );
}

export function VehicleResultsBarSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-10 items-center justify-between gap-4",
        className,
      )}
    >
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-11 w-44 rounded-full md:h-9" />
    </div>
  );
}

export function VehicleFilterToolbarSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-2",
        className,
      )}
    >
      <Skeleton className="h-11 w-full rounded-full sm:w-auto sm:min-w-56 sm:flex-1 md:h-9" />
      <Skeleton className="h-9 w-32 rounded-full" />
      <Skeleton className="h-9 w-28 rounded-full" />
      <Skeleton className="h-9 w-36 rounded-full" />
      <Skeleton className="h-9 w-24 rounded-full" />
    </div>
  );
}
