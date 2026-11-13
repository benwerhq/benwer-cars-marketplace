"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCompany } from "@/hooks/useCompany";
import { useVehicles } from "@/hooks/useVehicles";
import { CarGridSkeleton, CarGridView } from "./CarGrid";
import { LoadMoreCars } from "./LoadMoreCars";
import { useVisibleCount } from "@/hooks/useVisibleCount";
import { DateRangePopover } from "./DateRangePopover";
import {
  VehicleFilterToolbar,
  VehicleFilterToolbarSkeleton,
  VehicleResultsBar,
} from "./VehicleFilterToolbar";
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
  clearAdvancedFilters,
  hasActiveAdvancedFilters,
  parseBrowseParams,
  parseVehicleFilters,
} from "@/lib/vehicleFilters";
import type { AvailabilityRange } from "@/types/availability";
import type { Vehicle, VehicleFilters } from "@/types/vehicle";

const RESULTS_GRID_CLASS = "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
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

const PAGE_SIZE = 20;
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
  const filters: VehicleFilters = {
    ...parseVehicleFilters(searchParams),
    companySlugs: undefined,
    companySlug: undefined,
  };
  const browse = parseBrowseParams(searchParams);
  const { data, allVehicles, isPending, isError, error, refetch } = useVehicles(
    companySlug,
    channel ? { ...filters, channel } : filters,
  );
  const availabilityRange = resolveFleetDateRange(filters.from, filters.to);
  const availabilityQuery = useFleetAvailability(
    companySlug,
    {
      from: availabilityRange.from,
      to: availabilityRange.to,
      vehicleIds: allVehicles?.map((vehicle) => vehicle.id) ?? [],
      channel,
    },
    filterByAvailability && Boolean(allVehicles?.length),
  );
  const isLoading =
    isPending ||
    (filterByAvailability &&
      Boolean(allVehicles?.length) &&
      availabilityQuery.isPending);
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
  const fromDate = filters.from ? parseIsoDate(filters.from) : null;
  const toDate = filters.to ? parseIsoDate(filters.to) : null;
  const count = vehicles?.length ?? 0;
  const [visible, showMore] = useVisibleCount(
    PAGE_SIZE,
    searchParams.toString(),
  );
  const rows = layout === "rows";
  const days =
    fromDate && toDate
      ? Math.max(
          1,
          Math.round((toDate.getTime() - fromDate.getTime()) / DAY_MS),
        )
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

  function handleChange(next: VehicleFilters) {
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

  function clearFilters() {
    handleChange(clearAdvancedFilters(filters));
  }

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
      <VehicleFilterToolbar
        filters={filters}
        onChange={handleChange}
        vehicles={allVehicles}
        groupFilter
        footer={
          <VehicleResultsBar
            filters={filters}
            onChange={handleChange}
            summary={
              isLoading ? (
                <Skeleton className="h-4 w-36" />
              ) : isError ? null : (
                <p
                  className={
                    rows
                      ? "text-base text-muted-foreground"
                      : "text-sm text-muted-foreground"
                  }
                  aria-live="polite"
                >
                  {resultsLabel}
                </p>
              )
            }
          />
        }
      />
      <CarGridView
        vehicles={vehicles?.slice(0, visible)}
        isPending={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        buildHref={buildHref}
        companyFor={
          rows ? undefined : (vehicle) => resolveCardCompany(vehicle, directory)
        }
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
        onClearFilters={hasFilters ? clearFilters : undefined}
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
      {isLoading || isError ? null : (
        <LoadMoreCars
          shown={Math.min(visible, count)}
          total={count}
          onLoadMore={showMore}
        />
      )}
    </div>
  );
}

function CarListViewFallback() {
  return (
    <div className="flex flex-col gap-6">
      <VehicleFilterToolbarSkeleton />
      <CarGridSkeleton className={RESULTS_GRID_CLASS} />
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
  ranges: AvailabilityRange[] | undefined,
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
