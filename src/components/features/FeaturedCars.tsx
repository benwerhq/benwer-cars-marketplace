"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMarketplaceVehicles } from "@/hooks/useMarketplaceVehicles";
import { NavRoutes } from "@/enums";
import { buildCompanyCarHref } from "@/lib/companySite";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CarGridSkeleton, CarGridView } from "./CarGrid";
import type { Vehicle } from "@/types/vehicle";

const FEATURED_LIMIT = 6;
const FEATURED_GRID_CLASS =
  "gap-5 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2";

const VIEW_ALL_LINK_CLASS =
  "cursor-pointer text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function FeaturedCarsContent() {
  const t = useTranslations("featuredCars");
  const { data, isPending, isError, error, refetch } =
    useMarketplaceVehicles(undefined);

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
      <CarGridView
        vehicles={data?.slice(0, FEATURED_LIMIT)}
        isPending={isPending}
        isError={isError}
        error={error}
        onRetry={refetch}
        buildHref={buildHref}
        companyFor={companyFor}
        emptyTitle={t("emptyTitle")}
        emptyHint={t("emptyHint")}
        emptyActionLabel={t("seeAll")}
        emptyActionHref={NavRoutes.CARS}
        className={FEATURED_GRID_CLASS}
        skeletonCount={6}
        variant="row"
      />
      {!isPending && !isError && (data?.length ?? 0) > 0 ? (
        <div className="flex justify-center pt-2">
          <Link
            href={NavRoutes.CARS}
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "rounded-full px-8 font-semibold",
            )}
          >
            {t("seeAll")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function FeaturedCarsFallback() {
  return <CarGridSkeleton className={FEATURED_GRID_CLASS} count={6} />;
}

export function FeaturedCars() {
  const t = useTranslations("featuredCars");

  return (
    <section
      aria-labelledby="popular-cars-heading"
      className="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="popular-cars-heading"
          className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
        >
          {t("title")}
        </h2>
        <Link href={NavRoutes.CARS} className={VIEW_ALL_LINK_CLASS}>
          {t("seeAll")}
        </Link>
      </div>
      <Suspense fallback={<FeaturedCarsFallback />}>
        <FeaturedCarsContent />
      </Suspense>
    </section>
  );
}
