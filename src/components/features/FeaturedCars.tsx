"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMarketplaceVehicles } from "@/hooks/useMarketplaceVehicles";
import { NavRoutes } from "@/enums";
import { buildCompanyCarHref } from "@/lib/companySite";
import { CarGridView } from "./CarGrid";
import { SiteSectionHeading } from "./SiteSectionHeading";
import type { Vehicle } from "@/types/vehicle";

const FEATURED_GRID_CLASS = "gap-5 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2";

export function FeaturedCars() {
  const t = useTranslations("featuredCars");
  const { data, isPending, isError, error, refetch } = useMarketplaceVehicles(
    {},
  );

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
    <section
      aria-labelledby="popular-cars-heading"
      className="flex flex-col gap-8"
    >
      <SiteSectionHeading
        id="popular-cars-heading"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("subtitle")}
        action={
          <Link
            href={NavRoutes.CARS}
            className="cursor-pointer text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("viewAll")}
          </Link>
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
        emptyTitle={t("emptyTitle")}
        emptyHint={t("emptyHint")}
        emptyActionLabel={t("viewAll")}
        emptyActionHref={NavRoutes.CARS}
        className={FEATURED_GRID_CLASS}
        skeletonCount={4}
        variant="row"
      />
    </section>
  );
}
