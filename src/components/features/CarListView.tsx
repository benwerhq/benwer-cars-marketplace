"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useVehicles } from "@/hooks/useVehicles";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
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
import { formatSearchDate, hasCompleteSearchDates, parseIsoDate } from "@/lib/dates";
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
const VIEW_ALL_LINK_CLASS =
  "cursor-pointer text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

interface CarListViewProps {
  companySlug: string;
  hrefBase: string;
  showDirectoryEmptyAction?: boolean;
  showDateSearch?: boolean;
  filterByAvailability?: boolean;
  channel?: PublicChannel;
  layout?: CarListLayout;
  limit?: number;
  viewAllHref?: string;
  showFilters?: boolean;
  showHeader?: boolean;
  container?: boolean;
}

export type CarListLayout = "rail" | "rows";

const PAGE_SIZE = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

function CarListViewContent({
  companySlug,
  hrefBase,
  showDirectoryEmptyAction = false,
  showDateSearch,
  filterByAvailability = false,
  channel,
  layout = "rail",
  limit,
  viewAllHref,
  showFilters,
  showHeader,
  container = false,
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
  const checkAvailability =
    filterByAvailability && hasCompleteSearchDates(filters.from, filters.to);
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
    checkAvailability && Boolean(allVehicles?.length),
  );
  const isLoading =
    isPending ||
    (checkAvailability &&
      Boolean(allVehicles?.length) &&
      availabilityQuery.isPending);
  const sortedVehicles = checkAvailability
    ? sortVehiclesByAvailability(
        data,
        availabilityQuery.data,
        availabilityRange.from,
        availabilityRange.to,
      )
    : data;
  const hideUnavailable = layout === "rows" && checkAvailability;
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
  const hasFilters = hasActiveAdvancedFilters(filters);
  const fromDate = filters.from ? parseIsoDate(filters.from) : null;
  const toDate = filters.to ? parseIsoDate(filters.to) : null;
  const count = vehicles?.length ?? 0;
  const [visible, showMore] = useVisibleCount(
    PAGE_SIZE,
    searchParams.toString(),
  );
  const rows = layout === "rows";
  const resolvedViewAllHref = viewAllHref
    ? (() => {
        const base = new URL(viewAllHref, "https://benwer.local");
        searchParams.forEach((value, key) => {
          if (!base.searchParams.has(key)) {
            base.searchParams.set(key, value);
          }
        });
        const query = base.searchParams.toString();
        return `${base.pathname}${query ? `?${query}` : ""}${base.hash}`;
      })()
    : undefined;
  const shouldShowFilters = showFilters ?? !limit;
  const shouldShowHeader =
    showHeader ?? (!shouldShowFilters && Boolean(viewAllHref));
  const shouldShowDateSearch = showDateSearch ?? !limit;
  const days =
    fromDate && toDate
      ? Math.max(
          1,
          Math.round((toDate.getTime() - fromDate.getTime()) / DAY_MS),
        )
      : null;
  const availableCount = checkAvailability
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
    : checkAvailability
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
      {shouldShowDateSearch ? (
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
      {shouldShowHeader ? (
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {t("title")}
          </h2>
          {resolvedViewAllHref ? (
            <Link href={resolvedViewAllHref} className={VIEW_ALL_LINK_CLASS}>
              {t("seeAll")}
            </Link>
          ) : null}
        </div>
      ) : null}
      {shouldShowFilters ? (
        <VehicleFilterToolbar
          container={container}
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
      ) : null}
      {/* Single-company lists already show the mark in the site or banner
          header, so car cards do not repeat the logo. */}
      <CarGridView
        vehicles={
          limit ? vehicles?.slice(0, limit) : vehicles?.slice(0, visible)
        }
        isPending={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        buildHref={buildHref}
        isAvailable={
          checkAvailability
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
        skeletonCount={limit ?? (rows ? 4 : 8)}
        variant={rows ? "row" : "card"}
        days={days}
      />
      {resolvedViewAllHref && !isLoading && !isError && count > 0 ? (
        <div className="flex justify-center pt-2">
          <Link
            href={resolvedViewAllHref}
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "rounded-full px-8 font-semibold",
            )}
          >
            {t("seeAll")}
          </Link>
        </div>
      ) : null}
      {!resolvedViewAllHref && !limit && !isLoading && !isError ? (
        <LoadMoreCars
          shown={Math.min(visible, count)}
          total={count}
          onLoadMore={showMore}
        />
      ) : null}
    </div>
  );
}

function CarListViewFallback({
  showFilters = true,
  container = false,
}: {
  showFilters?: boolean;
  container?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      {showFilters ? (
        <VehicleFilterToolbarSkeleton container={container} />
      ) : null}
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
  limit,
  viewAllHref,
  showFilters,
  showHeader,
  container = false,
}: CarListViewProps) {
  const shouldShowFilters = showFilters ?? !limit;

  return (
    <Suspense
      fallback={
        <CarListViewFallback
          showFilters={shouldShowFilters}
          container={container}
        />
      }
    >
      <CarListViewContent
        companySlug={companySlug}
        hrefBase={hrefBase}
        showDirectoryEmptyAction={showDirectoryEmptyAction}
        showDateSearch={showDateSearch}
        filterByAvailability={filterByAvailability}
        channel={channel}
        layout={layout}
        limit={limit}
        viewAllHref={viewAllHref}
        showFilters={showFilters}
        showHeader={showHeader}
        container={container}
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
