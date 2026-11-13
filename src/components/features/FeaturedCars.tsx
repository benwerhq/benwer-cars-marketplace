"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCompanies } from "@/hooks/useCompanies";
import { useMarketplaceVehicles } from "@/hooks/useMarketplaceVehicles";
import { NavRoutes } from "@/enums";
import { buildCompanyCarHref } from "@/lib/companySite";
import {
  applyVehicleFilters,
  clearAdvancedFilters,
  hasActiveAdvancedFilters,
  parseVehicleFilters,
} from "@/lib/vehicleFilters";
import { CarGridSkeleton, CarGridView } from "./CarGrid";
import { SiteSectionHeading } from "./SiteSectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  VehicleFilterToolbar,
  VehicleFilterToolbarSkeleton,
  VehicleResultsBar,
} from "./VehicleFilterToolbar";
import type { Company } from "@/types/company";
import type { Vehicle, VehicleFilters } from "@/types/vehicle";

const FEATURED_GRID_CLASS =
  "gap-5 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2";

interface FeaturedCarsProps {
  initialCompanies?: Company[];
}

function FeaturedCarsContent({ initialCompanies }: FeaturedCarsProps) {
  const t = useTranslations("featuredCars");
  const tCars = useTranslations("cars");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = parseVehicleFilters(searchParams);
  const hasFilters = hasActiveAdvancedFilters(filters);
  const { data, allVehicles, isPending, isError, error, refetch } =
    useMarketplaceVehicles(filters);
  const companiesQuery = useCompanies();

  function handleChange(next: VehicleFilters) {
    const query = applyVehicleFilters(searchParams, next).toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function buildHref(vehicle: Vehicle): string {
    const company = companyFor(vehicle);
    return buildCompanyCarHref({
      slug: vehicle.companySlug,
      vehicleId: vehicle.id,
      websiteUrl: company?.websiteUrl,
    });
  }

  function companyFor(vehicle: Vehicle) {
    return (
      data?.find(
        (row) =>
          row.id === vehicle.id && row.companySlug === vehicle.companySlug,
      )?.company ?? null
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <VehicleFilterToolbar
        filters={filters}
        onChange={handleChange}
        vehicles={allVehicles}
        companies={companiesQuery.data ?? initialCompanies}
        footer={
          <VehicleResultsBar
            filters={filters}
            onChange={handleChange}
            summary={
              isPending ? (
                <Skeleton className="h-4 w-36" />
              ) : isError ? null : (
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {tCars("resultsCount", { count: data?.length ?? 0 })}
                </p>
              )
            }
          />
        }
      />
      <CarGridView
        vehicles={data}
        isPending={isPending}
        isError={isError}
        error={error}
        onRetry={refetch}
        buildHref={buildHref}
        companyFor={companyFor}
        emptyTitle={hasFilters ? tCars("noResults") : t("emptyTitle")}
        emptyHint={hasFilters ? tCars("noResultsHint") : t("emptyHint")}
        emptyActionLabel={hasFilters ? tCars("clearFilters") : t("viewAll")}
        emptyActionHref={hasFilters ? undefined : NavRoutes.CARS}
        onClearFilters={
          hasFilters
            ? () => handleChange(clearAdvancedFilters(filters))
            : undefined
        }
        className={FEATURED_GRID_CLASS}
        skeletonCount={4}
        variant="row"
      />
    </div>
  );
}

const VIEW_ALL_LINK_CLASS =
  "cursor-pointer text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function FilteredViewAllLink({ label }: { label: string }) {
  const searchParams = useSearchParams();
  const query = applyVehicleFilters(
    new URLSearchParams(),
    parseVehicleFilters(searchParams),
  ).toString();

  return (
    <Link
      href={query ? `${NavRoutes.CARS}?${query}` : NavRoutes.CARS}
      className={VIEW_ALL_LINK_CLASS}
    >
      {label}
    </Link>
  );
}

function ViewAllLink() {
  const t = useTranslations("featuredCars");

  return (
    <Suspense
      fallback={
        <Link href={NavRoutes.CARS} className={VIEW_ALL_LINK_CLASS}>
          {t("viewAll")}
        </Link>
      }
    >
      <FilteredViewAllLink label={t("viewAll")} />
    </Suspense>
  );
}

function FeaturedCarsFallback() {
  return (
    <div className="flex flex-col gap-5">
      <VehicleFilterToolbarSkeleton />
      <CarGridSkeleton className={FEATURED_GRID_CLASS} count={4} />
    </div>
  );
}

export function FeaturedCars({ initialCompanies }: FeaturedCarsProps) {
  const t = useTranslations("featuredCars");

  return (
    <section
      aria-labelledby="popular-cars-heading"
      className="flex flex-col gap-8"
    >
      <SiteSectionHeading
        id="popular-cars-heading"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("subtitle")}
        action={<ViewAllLink />}
      />
      <Suspense fallback={<FeaturedCarsFallback />}>
        <FeaturedCarsContent initialCompanies={initialCompanies} />
      </Suspense>
    </section>
  );
}
