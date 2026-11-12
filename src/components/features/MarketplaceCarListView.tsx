"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCompanies } from "@/hooks/useCompanies";
import { useMarketplaceVehicles } from "@/hooks/useMarketplaceVehicles";
import { CarGridSkeleton, CarGridView } from "./CarGrid";
import { FilterRail, FilterRailSkeleton } from "./FilterRail";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { isProvinceWideLocation, resolveCitySlug } from "@/data/malagaCities";
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
  countAdvancedFilters,
  hasActiveAdvancedFilters,
  parseBrowseParams,
  parseVehicleFilters,
} from "@/lib/vehicleFilters";
import type { Vehicle } from "@/types/vehicle";

const RESULTS_GRID_CLASS = "gap-5 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1";

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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const marketplaceFilters = {
    ...filters,
    location,
  };
  const { data, isPending, isError, error, refetch } =
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
  const appliedCount = countAdvancedFilters(filters);
  const fromDate = filters.from ? parseIsoDate(filters.from) : null;
  const toDate = filters.to ? parseIsoDate(filters.to) : null;
  const count = data?.length ?? 0;
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
    const params = applyVehicleFilters(searchParams, next);
    if (location) {
      params.set(SearchParams.LOCATION, location);
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

  function clearAdvancedFilters() {
    handleChange({
      from: filters.from,
      to: filters.to,
      branchId: filters.branchId,
    });
  }

  const filterRail = (prefix: string, className?: string) => (
    <FilterRail
      filters={filters}
      onChange={handleChange}
      companies={companiesQuery.data ?? []}
      idPrefix={prefix}
      className={className}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        {isPending ? (
          <Skeleton className="h-4 w-36" />
        ) : isError ? (
          <span />
        ) : (
          <p className="text-sm text-muted-foreground">{resultsLabel}</p>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setFiltersOpen(true)}
          className="min-h-11 lg:hidden"
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
        <aside className="hidden lg:block lg:w-72 lg:shrink-0 xl:w-80">
          <div className="sticky top-20">{filterRail("desktop")}</div>
        </aside>
        <div className="min-w-0 flex-1">
          <CarGridView
            vehicles={data}
            isPending={isPending}
            isError={isError}
            error={error}
            onRetry={refetch}
            buildHref={buildHref}
            companyFor={companyFor}
            emptyTitle={t("searchEmptyTitle")}
            emptyHint={t("searchEmptyHint")}
            emptyActionLabel={
              hasFilters ? t("clearFilters") : t("browseCompanies")
            }
            emptyActionHref={hasFilters ? undefined : NavRoutes.COMPANIES}
            onClearFilters={hasFilters ? clearAdvancedFilters : undefined}
            className={RESULTS_GRID_CLASS}
            variant="row"
            days={
              hasDates && filters.from && filters.to
                ? countRentalDays(filters.from, filters.to)
                : null
            }
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
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 w-full sm:w-auto"
                onClick={clearAdvancedFilters}
              >
                {t("clearFilters")}
              </Button>
            ) : (
              <span className="hidden sm:block" />
            )}
            <Button
              type="button"
              className="min-h-11 w-full sm:w-auto"
              onClick={() => setFiltersOpen(false)}
            >
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

function MarketplaceCarListFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-24 lg:hidden" />
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="hidden lg:block lg:w-72 xl:w-80">
          <FilterRailSkeleton />
        </div>
        <div className="min-w-0 flex-1">
          <CarGridSkeleton className={RESULTS_GRID_CLASS} />
        </div>
      </div>
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
