"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCompanies } from "@/hooks/useCompanies";
import { useMarketplaceVehicles } from "@/hooks/useMarketplaceVehicles";
import { CarGridSkeleton, CarGridView } from "./CarGrid";
import { LoadMoreCars } from "./LoadMoreCars";
import { useVisibleCount } from "@/hooks/useVisibleCount";
import {
  VehicleFilterToolbar,
  VehicleFilterToolbarSkeleton,
  VehicleResultsBar,
} from "./VehicleFilterToolbar";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  isProvinceWideLocation,
  resolveCitySlug,
  toApiLocation,
} from "@/data/malagaCities";
import { NavRoutes, SearchParams } from "@/enums";
import {
  countRentalDays,
  formatSearchDate,
  hasCompleteSearchDates,
  parseIsoDate,
} from "@/lib/dates";
import { resolveCardCompany } from "@/lib/companyIdentity";
import { locationLabelFromSlug } from "@/lib/locationOptions";
import { buildCompanyCarHref } from "@/lib/companySite";
import {
  applyVehicleFilters,
  clearAdvancedFilters,
  hasActiveAdvancedFilters,
  parseBrowseParams,
  parseVehicleFilters,
} from "@/lib/vehicleFilters";
import type { Vehicle } from "@/types/vehicle";

const PAGE_SIZE = 20;
const RESULTS_GRID_CLASS = "gap-5 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2";

function MarketplaceCarListContent() {
  const t = useTranslations("cars");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = parseVehicleFilters(searchParams);
  const browse = parseBrowseParams(searchParams);
  const location = resolveCitySlug(browse.location ?? null);
  const hasDates = hasCompleteSearchDates(filters.from, filters.to);
  const marketplaceFilters = {
    ...filters,
    location,
  };
  const { data, allVehicles, isPending, isError, error, refetch } =
    useMarketplaceVehicles(marketplaceFilters);
  const driverAge = searchParams.get(SearchParams.DRIVER_AGE) ?? undefined;
  const companiesQuery = useCompanies(
    hasDates
      ? {
          location,
          from: filters.from,
          to: filters.to,
        }
      : {
          location,
        },
  );

  const hasFilters = hasActiveAdvancedFilters(filters);
  const fromDate = filters.from ? parseIsoDate(filters.from) : null;
  const toDate = filters.to ? parseIsoDate(filters.to) : null;
  const count = data?.length ?? 0;
  const [visible, showMore] = useVisibleCount(
    PAGE_SIZE,
    searchParams.toString(),
  );
  const branchName = companiesQuery.data
    ?.flatMap((company) => company.branches)
    .find((branch) => branch.id === filters.branchId)?.name;
  const cityLabel =
    branchName ??
    (!isProvinceWideLocation(location)
      ? locationLabelFromSlug(location, locale)
      : null);
  const placeLabel = cityLabel
    ? t("resultsInCity", {
        count,
        city: cityLabel,
      })
    : t("resultsInProvince", { count });
  const resultsLabel =
    fromDate && toDate
      ? t("resultsForDates", {
          count,
          from: formatSearchDate(fromDate, locale),
          to: formatSearchDate(toDate, locale),
        })
      : placeLabel;

  function handleChange(next: typeof filters) {
    // applyVehicleFilters keeps the URL's own params; never add the default "All locations" slug.
    const params = applyVehicleFilters(searchParams, next);
    const pickedLocation = toApiLocation(browse.location);
    if (pickedLocation) {
      params.set(SearchParams.LOCATION, pickedLocation);
    } else {
      params.delete(SearchParams.LOCATION);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function buildHref(vehicle: Vehicle): string {
    const listed = companiesQuery.data?.find(
      (company) => company.slug === vehicle.companySlug,
    );
    return buildCompanyCarHref({
      slug: vehicle.companySlug,
      vehicleId: vehicle.id,
      websiteUrl: listed?.websiteUrl,
      from: browse.from,
      to: browse.to,
      params: {
        [SearchParams.DRIVER_AGE]: driverAge,
        [SearchParams.BRANCH]: filters.branchId,
        [SearchParams.RETURN_BRANCH]:
          searchParams.get(SearchParams.RETURN_BRANCH) ?? undefined,
      },
    });
  }

  function companyFor(vehicle: Vehicle) {
    return resolveCardCompany(vehicle, companiesQuery.data);
  }

  function clearFilters() {
    handleChange(clearAdvancedFilters(filters));
  }

  return (
    <div className="flex flex-col gap-5">
      <VehicleFilterToolbar
        filters={filters}
        onChange={handleChange}
        vehicles={allVehicles}
        companies={companiesQuery.data}
        footer={
          <VehicleResultsBar
            filters={filters}
            onChange={handleChange}
            summary={
              isPending ? (
                <Skeleton className="h-4 w-36" />
              ) : isError ? null : (
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {resultsLabel}
                </p>
              )
            }
          />
        }
      />
      <CarGridView
        vehicles={data?.slice(0, visible)}
        isPending={isPending}
        isError={isError}
        error={error}
        onRetry={refetch}
        buildHref={buildHref}
        companyFor={companyFor}
        emptyTitle={t("searchEmptyTitle")}
        emptyHint={t("searchEmptyHint")}
        emptyActionLabel={hasFilters ? t("clearFilters") : t("browseCompanies")}
        emptyActionHref={hasFilters ? undefined : NavRoutes.COMPANIES}
        onClearFilters={hasFilters ? clearFilters : undefined}
        className={RESULTS_GRID_CLASS}
        variant="row"
        days={
          hasDates && filters.from && filters.to
            ? countRentalDays(filters.from, filters.to)
            : null
        }
      />
      {isPending || isError ? null : (
        <LoadMoreCars
          shown={Math.min(visible, count)}
          total={count}
          onLoadMore={showMore}
        />
      )}
    </div>
  );
}

function MarketplaceCarListFallback() {
  return (
    <div className="flex flex-col gap-5">
      <VehicleFilterToolbarSkeleton />
      <CarGridSkeleton className={RESULTS_GRID_CLASS} />
    </div>
  );
}
export function MarketplaceCarListView() {
  return (
    <Suspense fallback={<MarketplaceCarListFallback />}>
      <MarketplaceCarListContent />
    </Suspense>
  );
}
