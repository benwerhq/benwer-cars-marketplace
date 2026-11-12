"use client";

import { Car } from "lucide-react";
import { useTranslations } from "next-intl";
import { CarCard } from "./CarCard";
import { CarRowCard } from "./CarRowCard";
import { CarCardSkeleton } from "./CarCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { getErrorKey } from "@/lib/errors";
import type { Company } from "@/types/company";
import type { Vehicle } from "@/types/vehicle";
import { cn } from "@/lib/utils";

interface CarGridLoadingProps {
  count?: number;
  className?: string;
}

export function CarGridSkeleton({ count = 8, className }: CarGridLoadingProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CarCardSkeleton key={i} />
      ))}
    </div>
  );
}

interface CarGridProps {
  vehicles: Vehicle[];
  buildHref: (vehicle: Vehicle) => string;
  companyFor?: (
    vehicle: Vehicle,
  ) => Pick<Company, "name" | "slug" | "branding"> | null;
  isAvailable?: (vehicle: Vehicle) => boolean;
  onClearFilters?: () => void;
  emptyTitle?: string;
  emptyHint?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  className?: string;
  variant?: CarGridVariant;
  days?: number | null;
}

export type CarGridVariant = "card" | "row";

export function CarGrid({
  vehicles,
  buildHref,
  companyFor,
  isAvailable,
  onClearFilters,
  emptyTitle,
  emptyHint,
  emptyActionLabel,
  emptyActionHref,
  className,
  variant = "card",
  days = null,
}: CarGridProps) {
  const t = useTranslations("cars");

  if (vehicles.length === 0) {
    return (
      <EmptyState
        icon={<Car size={28} />}
        title={
          emptyTitle ?? (onClearFilters ? t("noResults") : t("emptyTitle"))
        }
        description={
          emptyHint ?? (onClearFilters ? t("noResultsHint") : t("emptyHint"))
        }
        actionLabel={
          emptyActionLabel ?? (onClearFilters ? t("clearFilters") : undefined)
        }
        actionHref={onClearFilters ? undefined : emptyActionHref}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {vehicles.map((vehicle, index) =>
        variant === "row" ? (
          <CarRowCard
            key={`${vehicle.companySlug}-${vehicle.id}`}
            vehicle={vehicle}
            href={buildHref(vehicle)}
            days={days}
            priority={index === 0}
            available={isAvailable?.(vehicle) ?? true}
            company={companyFor?.(vehicle)}
          />
        ) : (
          <CarCard
            key={`${vehicle.companySlug}-${vehicle.id}`}
            vehicle={vehicle}
            href={buildHref(vehicle)}
            company={companyFor?.(vehicle)}
            priority={index === 0}
            available={isAvailable?.(vehicle) ?? true}
          />
        ),
      )}
    </div>
  );
}

interface CarGridViewProps {
  vehicles: Vehicle[] | undefined;
  isPending: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  buildHref: (vehicle: Vehicle) => string;
  companyFor?: (
    vehicle: Vehicle,
  ) => Pick<Company, "name" | "slug" | "branding"> | null;
  isAvailable?: (vehicle: Vehicle) => boolean;
  onClearFilters?: () => void;
  emptyTitle?: string;
  emptyHint?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  className?: string;
  skeletonCount?: number;
  variant?: CarGridVariant;
  days?: number | null;
}

export function CarGridView({
  vehicles,
  isPending,
  isError,
  error,
  onRetry,
  buildHref,
  companyFor,
  isAvailable,
  onClearFilters,
  emptyTitle,
  emptyHint,
  emptyActionLabel,
  emptyActionHref,
  className,
  skeletonCount,
  variant,
  days,
}: CarGridViewProps) {
  const t = useTranslations();

  if (isPending) {
    return <CarGridSkeleton count={skeletonCount} className={className} />;
  }
  if (isError) {
    return <ErrorState message={t(getErrorKey(error))} onRetry={onRetry} />;
  }
  return (
    <CarGrid
      vehicles={vehicles ?? []}
      buildHref={buildHref}
      companyFor={companyFor}
      isAvailable={isAvailable}
      onClearFilters={onClearFilters}
      emptyTitle={emptyTitle}
      emptyHint={emptyHint}
      emptyActionLabel={emptyActionLabel}
      emptyActionHref={emptyActionHref}
      className={className}
      variant={variant}
      days={days}
    />
  );
}
