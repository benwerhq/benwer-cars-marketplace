"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCompany } from "@/hooks/useCompany";
import { useVehicles } from "@/hooks/useVehicles";
import { CarGridSkeleton, CarGridView } from "./CarGrid";
import { DateRangePopover } from "./DateRangePopover";
import { FilterRail, FilterRailSkeleton } from "./FilterRail";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatSearchDate, parseIsoDate } from "@/lib/dates";
import { resolveCardCompany } from "@/lib/companyIdentity";
import { NavRoutes, SearchParams, type PublicChannel } from "@/enums";
import { appendSearchParams } from "@/lib/marketplaceSearch";
import {
  isFleetVehicleAvailable,
  resolveFleetDateRange,
} from "@/lib/availability";
import { useFleetAvailability } from "@/hooks/useFleetAvailability";
import {
  applyVehicleFilters,
  countAdvancedFilters,
  hasActiveAdvancedFilters,
  parseBrowseParams,
  parseVehicleFilters,
} from "@/lib/vehicleFilters";
import type { Vehicle } from "@/types/vehicle";

const RESULTS_GRID_CLASS = "sm:grid-cols-2 xl:grid-cols-3";
const ROWS_GRID_CLASS = "sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-5";

interface CarListViewProps {
  companySlug: string;
  hrefBase: string;
  showDirectoryEmptyAction?: boolean;
  showDateSearch?: boolean;
  filterByAvailability?: boolean;
  channel?: PublicChannel;
  layout?: CarListLayout;
}

export type CarListLayout = "rail" | "rows";

const DAY_MS = 24 * 60 * 60 * 1000;

function CarListViewContent({
  companySlug,
  hrefBase,
  showDirectoryEmptyAction = false,
  showDateSearch = true,
  filterByAvailability = false,
  channel,
  layout = "rail",
}: CarListViewProps) {
  const t = useTranslations("cars");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = parseVehicleFilters(searchParams);
  const browse = parseBrowseParams(searchParams);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data, isPending, isError, error, refetch } = useVehicles(
    companySlug,
    channel ? { ...filters, channel } : filters,
  );
  const availabilityRange = resolveFleetDateRange(filters.from, filters.to);
  const availabilityQuery = useFleetAvailability(
    companySlug,
    {
      from: availabilityRange.from,
      to: availabilityRange.to,
      vehicleIds: data?.map((vehicle) => vehicle.id) ?? [],
      channel,
    },
    filterByAvailability && Boolean(data?.length),
  );
  const sortedVehicles = filterByAvailability
    ? sortVehiclesByAvailability(
        data,
        availabilityQuery.data,
        availabilityRange.from,
        availabilityRange.to,
      )
    : data;
  const hideUnavailable = layout === "rows" && filterByAvailability;
  const vehicles =
    hideUnavailable && availabilityQuery.data
      ? sortedVehicles?.filter((vehicle) =>
          isFleetVehicleAvailable(
            vehicle,
            availabilityQuery.data,
            availabilityRange.from,
            availabilityRange.to,
          ),
        )
      : sortedVehicles;
  const companyQuery = useCompany(companySlug);
  const directory = companyQuery.data ? [companyQuery.data] : [];

  const hasFilters = hasActiveAdvancedFilters(filters);
  const appliedCount = countAdvancedFilters(filters);
  const fromDate = filters.from ? parseIsoDate(filters.from) : null;
  const toDate = filters.to ? parseIsoDate(filters.to) : null;
  const count = vehicles?.length ?? 0;
  const rows = layout === "rows";
  const days =
    fromDate && toDate
      ? Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / DAY_MS))
      : null;
  const availableCount = filterByAvailability
    ? (vehicles?.filter((vehicle) =>
        isFleetVehicleAvailable(
          vehicle,
          availabilityQuery.data,
          availabilityRange.from,
          availabilityRange.to,
        ),
      ).length ?? 0)
    : count;
  const resultsLabel = hideUnavailable
    ? fromDate && toDate
      ? t("availableForDates", {
          count,
          from: formatSearchDate(fromDate, locale),
          to: formatSearchDate(toDate, locale),
        })
      : t("availableCount", { count })
    : filterByAvailability
    ? fromDate && toDate
      ? t("fleetSummaryForDates", {
          total: count,
          available: availableCount,
          from: formatSearchDate(fromDate, locale),
          to: formatSearchDate(toDate, locale),
        })
      : t("fleetSummary", { total: count, available: availableCount })
    : fromDate && toDate
      ? t("resultsForDates", {
          count,
          from: formatSearchDate(fromDate, locale),
          to: formatSearchDate(toDate, locale),
        })
      : t("resultsCount", { count });

  function handleChange(next: typeof filters) {
    const params = applyVehicleFilters(searchParams, next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function buildHref(vehicle: Vehicle): string {
    return appendSearchParams(`${hrefBase}/${encodeURIComponent(vehicle.id)}`, {
      location: browse.location,
      from: browse.from,
      to: browse.to,
      preview: searchParams.get(SearchParams.PREVIEW) || undefined,
      branch: searchParams.get(SearchParams.BRANCH) || undefined,
      return: searchParams.get(SearchParams.RETURN_BRANCH) || undefined,
      age: searchParams.get(SearchParams.DRIVER_AGE) || undefined,
    });
  }

  function clearAdvancedFilters() {
    handleChange({
      from: filters.from,
      to: filters.to,
    });
  }

  const filterRail = (prefix: string, className?: string) => (
    <FilterRail
      filters={filters}
      onChange={handleChange}
      showCompanies={false}
      idPrefix={prefix}
      className={className}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      {showDateSearch ? (
        <div className="rounded-2xl border border-border bg-surface p-2 shadow-md md:p-2.5">
          <DateRangePopover
            from={filters.from ?? ""}
            to={filters.to ?? ""}
            onChange={(next) =>
              handleChange({
                ...filters,
                from: next.from || undefined,
                to: next.to || undefined,
              })
            }
          />
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        {isPending ? (
          <Skeleton className="h-4 w-36" />
        ) : isError ? (
          <span />
        ) : (
          <p className={rows ? "text-base text-muted-foreground" : "text-sm text-muted-foreground"}>
            {resultsLabel}
          </p>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setFiltersOpen(true)}
          className={rows ? "rounded-full" : "lg:hidden"}
          aria-label={t("filters.openAria", { count: appliedCount })}
        >
          <SlidersHorizontal size={16} aria-hidden />
          {t("filters.title")}
          {appliedCount ? (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
              {appliedCount}
            </span>
          ) : null}
        </Button>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {rows ? null : (
          <aside className="hidden lg:block lg:w-72 lg:shrink-0 xl:w-80">
            <div className="sticky top-20">{filterRail("desktop")}</div>
          </aside>
        )}
        <div className="min-w-0 flex-1">
          <CarGridView
            vehicles={vehicles}
            isPending={isPending}
            isError={isError}
            error={error}
            onRetry={refetch}
            buildHref={buildHref}
            companyFor={(vehicle) => resolveCardCompany(vehicle, directory)}
            isAvailable={
              filterByAvailability
                ? (vehicle) =>
                    isFleetVehicleAvailable(
                      vehicle,
                      availabilityQuery.data,
                      availabilityRange.from,
                      availabilityRange.to,
                    )
                : undefined
            }
            onClearFilters={hasFilters ? clearAdvancedFilters : undefined}
            emptyActionLabel={
              hasFilters || !showDirectoryEmptyAction
                ? undefined
                : t("browseCompanies")
            }
            emptyActionHref={
              hasFilters || !showDirectoryEmptyAction
                ? undefined
                : NavRoutes.COMPANIES
            }
            className={rows ? ROWS_GRID_CLASS : RESULTS_GRID_CLASS}
            variant={rows ? "row" : "card"}
            days={days}
          />
        </div>
      </div>
      <Sheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title={t("filters.title")}
        description={
          appliedCount
            ? t("filters.appliedCount", { count: appliedCount })
            : undefined
        }
        closeLabel={t("filters.close")}
        footer={
          <div className="flex items-center justify-between gap-3">
            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                onClick={clearAdvancedFilters}
              >
                {t("clearFilters")}
              </Button>
            ) : (
              <span />
            )}
            <Button type="button" onClick={() => setFiltersOpen(false)}>
              {t("filters.done")}
            </Button>
          </div>
        }
      >
        {filterRail("mobile", "border-0 p-0 shadow-none")}
      </Sheet>
    </div>
  );
}

function CarListViewFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-surface p-2 shadow-md md:p-2.5">
        <div className="flex flex-col gap-2 md:flex-row">
          <Skeleton className="h-12 w-full md:flex-1" />
          <Skeleton className="h-12 w-full md:flex-1" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-24 lg:hidden" />
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="hidden lg:block lg:w-72 xl:w-80">
          <FilterRailSkeleton showCompanies={false} />
        </div>
        <div className="min-w-0 flex-1">
          <CarGridSkeleton className={RESULTS_GRID_CLASS} />
        </div>
      </div>
    </div>
  );
}

export function CarListView({
  companySlug,
  hrefBase,
  showDirectoryEmptyAction,
  showDateSearch,
  filterByAvailability,
  channel,
  layout,
}: CarListViewProps) {
  return (
    <Suspense fallback={<CarListViewFallback />}>
      <CarListViewContent
        companySlug={companySlug}
        hrefBase={hrefBase}
        showDirectoryEmptyAction={showDirectoryEmptyAction}
        showDateSearch={showDateSearch}
        filterByAvailability={filterByAvailability}
        channel={channel}
        layout={layout}
      />
    </Suspense>
  );
}

function sortVehiclesByAvailability(
  vehicles: Vehicle[] | undefined,
  ranges: { vehicleId: string; unavailableDates: string[] }[] | undefined,
  from: string,
  to: string,
): Vehicle[] | undefined {
  if (!vehicles) {
    return vehicles;
  }

  return [...vehicles].sort((a, b) => {
    const aAvailable = isFleetVehicleAvailable(a, ranges, from, to);
    const bAvailable = isFleetVehicleAvailable(b, ranges, from, to);
    if (aAvailable === bAvailable) {
      return 0;
    }
    return aAvailable ? -1 : 1;
  });
}
