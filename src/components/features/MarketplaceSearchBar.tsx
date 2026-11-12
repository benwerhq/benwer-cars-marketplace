"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { CityCombobox } from "./CityCombobox";
import { DateRangePopover } from "./DateRangePopover";
import { DriverAgeSelect } from "./DriverAgeSelect";
import { Skeleton } from "@/components/ui/Skeleton";
import { DEFAULT_CITY_SLUG, resolveCitySlug } from "@/data/malagaCities";
import { DriverAgeBand, NavRoutes, SearchParams } from "@/enums";
import { hasCompleteSearchDates } from "@/lib/dates";
import { buildCompaniesSearchHref } from "@/lib/marketplaceSearch";
import { parseDriverAge } from "@/lib/site";
import { applyVehicleFilters, parseVehicleFilters } from "@/lib/vehicleFilters";
import { cn } from "@/lib/utils";

interface MarketplaceSearchBarProps {
  className?: string;
  target?: "cars" | "companies";
}

const CARD_CLASS =
  "flex min-w-0 w-full flex-col rounded-[2rem] border border-border bg-surface shadow-xl";
const ROW_CLASS =
  "flex min-w-0 flex-col gap-1 p-3 md:flex-row md:items-center md:gap-1 md:p-2.5 md:pl-3";
const TOP_BAR_CLASS =
  "flex flex-wrap items-center justify-end gap-x-6 gap-y-2 border-b border-border px-5 py-2.5 md:px-6";
const DIVIDER_CLASS = "hidden w-px self-stretch bg-border md:my-2 md:block";

function MarketplaceSearchForm({
  className,
  initialLocation,
  initialFrom,
  initialTo,
  initialDriverAge,
  view,
  target = "cars",
}: MarketplaceSearchBarProps & {
  initialLocation: string;
  initialFrom: string;
  initialTo: string;
  initialDriverAge: DriverAgeBand;
  view?: string;
}) {
  const t = useTranslations("search");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState(initialLocation);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [driverAge, setDriverAge] = useState(initialDriverAge);
  const hasDates = hasCompleteSearchDates(from, to);
  const isCars = target === "cars";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isCars) {
      router.push(
        buildCompaniesSearchHref({
          location: location || DEFAULT_CITY_SLUG,
          from: hasDates ? from : undefined,
          to: hasDates ? to : undefined,
          view,
        }),
      );
      return;
    }

    const next = applyVehicleFilters(searchParams, {
      ...parseVehicleFilters(searchParams),
      from: hasDates ? from : undefined,
      to: hasDates ? to : undefined,
    });
    next.set(SearchParams.LOCATION, location || DEFAULT_CITY_SLUG);
    next.set(SearchParams.DRIVER_AGE, driverAge);
    router.push(`${NavRoutes.CARS}?${next.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={t("submit")}
      className={cn(CARD_CLASS, className)}
    >
      {isCars ? (
        <div className={TOP_BAR_CLASS}>
          <DriverAgeSelect
            id="marketplace-driver-age"
            value={driverAge}
            onChange={setDriverAge}
          />
        </div>
      ) : null}
      <div className={ROW_CLASS}>
        <div className="min-w-0 md:flex-1">
          <CityCombobox
            value={location}
            onChange={setLocation}
            from={isCars ? from : undefined}
            to={isCars ? to : undefined}
          />
        </div>
        {isCars ? (
          <>
            <span aria-hidden className={DIVIDER_CLASS} />
            <div className="min-w-0 md:flex-[1.6]">
              <DateRangePopover
                from={from}
                to={to}
                onChange={(next) => {
                  setFrom(next.from);
                  setTo(next.to);
                }}
              />
            </div>
          </>
        ) : null}
        <button
          type="submit"
          className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:ml-2 md:h-16 md:w-16 md:px-0"
        >
          <Search size={22} strokeWidth={2.25} aria-hidden />
          <span className="md:sr-only">{t("submit")}</span>
        </button>
      </div>
    </form>
  );
}

export function MarketplaceSearchBar({
  className,
  target = "cars",
}: MarketplaceSearchBarProps) {
  const searchParams = useSearchParams();
  const locationParam = searchParams.get(SearchParams.LOCATION);
  const fromParam = searchParams.get(SearchParams.FROM) ?? "";
  const toParam = searchParams.get(SearchParams.TO) ?? "";
  const viewParam = searchParams.get(SearchParams.VIEW) ?? "";
  const ageParam = searchParams.get(SearchParams.DRIVER_AGE);

  return (
    <MarketplaceSearchForm
      key={`${locationParam ?? ""}|${fromParam}|${toParam}|${viewParam}|${ageParam ?? ""}|${target}`}
      className={className}
      initialLocation={resolveCitySlug(locationParam)}
      initialFrom={fromParam}
      initialTo={toParam}
      initialDriverAge={parseDriverAge(ageParam)}
      view={viewParam || undefined}
      target={target}
    />
  );
}

export function MarketplaceSearchBarFallback({
  className,
  target = "cars",
}: MarketplaceSearchBarProps) {
  return (
    <div className={cn(CARD_CLASS, className)}>
      {target === "cars" ? (
        <div className={TOP_BAR_CLASS}>
          <Skeleton className="h-7 w-40 rounded-full" />
        </div>
      ) : null}
      <div className={ROW_CLASS}>
        <Skeleton className="h-12 w-full md:flex-1" />
        {target === "cars" ? (
          <Skeleton className="h-12 w-full md:flex-[1.6]" />
        ) : null}
        <Skeleton className="h-12 w-full rounded-full md:h-16 md:w-16" />
      </div>
    </div>
  );
}
