"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMarketplaceVehicles } from "@/hooks/useMarketplaceVehicles";
import { NavRoutes } from "@/enums";
import { buildCompanyCarHref } from "@/lib/companySite";
import { CarGridView } from "./CarGrid";
import type { Vehicle } from "@/types/vehicle";

const FEATURED_LIMIT = 4;
const FEATURED_GRID_CLASS = "sm:grid-cols-2 xl:grid-cols-4";

export function FeaturedCars() {
  const t = useTranslations("featuredCars");
  const { data, isPending, isError, error, refetch } = useMarketplaceVehicles(
    {},
  );
  const vehicles = data?.slice(0, FEATURED_LIMIT);

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
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="min-w-0 text-xl font-semibold text-foreground">
            {t("title")}
          </h2>
          <Link
            href={NavRoutes.CARS}
            className="shrink-0 cursor-pointer text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("viewAll")}
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <CarGridView
        vehicles={vehicles}
        isPending={isPending}
        isError={isError}
        error={error}
        onRetry={refetch}
        buildHref={buildHref}
        companyFor={companyFor}
        emptyTitle={t("emptyTitle")}
        emptyHint={t("emptyHint")}
        emptyActionLabel={t("viewAll")}
        emptyActionHref={NavRoutes.CARS}
        className={FEATURED_GRID_CLASS}
        skeletonCount={FEATURED_LIMIT}
      />
    </section>
  );
}
