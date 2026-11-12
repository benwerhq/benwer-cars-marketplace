"use client";

import { useId, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { CityCombobox } from "./CityCombobox";
import { DateRangePopover } from "./DateRangePopover";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { DEFAULT_CITY_SLUG, resolveCitySlug } from "@/data/malagaCities";
import { NavRoutes, SearchParams } from "@/enums";
import { hasCompleteSearchDates } from "@/lib/dates";
import { buildCompaniesSearchHref } from "@/lib/marketplaceSearch";
import { applyVehicleFilters, parseVehicleFilters } from "@/lib/vehicleFilters";
import { cn } from "@/lib/utils";

interface MarketplaceSearchBarProps {
  className?: string;
  target?: "cars" | "companies";
  datesOpen?: boolean;
  onDatesOpenChange?: (open: boolean) => void;
}

function MarketplaceSearchForm({
  className,
  initialLocation,
  initialFrom,
  initialTo,
  view,
  target = "cars",
  datesOpen,
  onDatesOpenChange,
}: MarketplaceSearchBarProps & {
  initialLocation: string;
  initialFrom: string;
  initialTo: string;
  view?: string;
}) {
  const t = useTranslations("search");
  const router = useRouter();
  const searchParams = useSearchParams();
  const hintId = useId();
  const requireDates = target === "cars";
  const [location, setLocation] = useState(initialLocation);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [showDateHint, setShowDateHint] = useState(false);
  const [internalDatesOpen, setInternalDatesOpen] = useState(false);
  const isDatesOpen = datesOpen ?? internalDatesOpen;
  const hasDates = hasCompleteSearchDates(from, to);

  function handleDatesOpenChange(next: boolean) {
    if (datesOpen === undefined) {
      setInternalDatesOpen(next);
    }
    onDatesOpenChange?.(next);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requireDates && !hasDates) {
      setShowDateHint(true);
      handleDatesOpenChange(true);
      return;
    }

    handleDatesOpenChange(false);

    if (target === "companies") {
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
      from,
      to,
    });
    next.set(SearchParams.LOCATION, location || DEFAULT_CITY_SLUG);
    router.push(`${NavRoutes.CARS}?${next.toString()}`);
  }

  const dateHint =
    requireDates && showDateHint && !hasDates ? t("datesRequired") : null;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "marketplace-search-card min-w-0 w-full rounded-2xl p-2 md:p-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1 md:flex-row md:items-stretch md:gap-0">
        <div className="min-w-0 md:flex-1">
          <CityCombobox
            value={location}
            onChange={setLocation}
            from={target === "cars" ? from : undefined}
            to={target === "cars" ? to : undefined}
          />
        </div>
        {target === "cars" ? (
          <>
            <div
              aria-hidden
              className="bg-border h-px w-full md:mx-0 md:my-1.5 md:h-auto md:w-px md:self-stretch"
            />
            <DateRangePopover
              from={from}
              to={to}
              required={requireDates}
              invalid={showDateHint && !hasDates}
              open={isDatesOpen}
              onOpenChange={handleDatesOpenChange}
              describedBy={dateHint ? hintId : undefined}
              onChange={(next) => {
                setFrom(next.from);
                setTo(next.to);
                if (hasCompleteSearchDates(next.from, next.to)) {
                  setShowDateHint(false);
                }
              }}
            />
          </>
        ) : null}
        <div className="md:ml-1.5 md:self-center">
          <Button
            type="submit"
            size="lg"
            className="min-h-11 h-11 w-full shrink-0 rounded-xl md:min-w-28 md:w-auto"
            aria-describedby={dateHint ? hintId : undefined}
          >
            <Search size={16} aria-hidden />
            {t("submit")}
          </Button>
        </div>
      </div>
      {dateHint ? (
        <p id={hintId} className="px-3 pt-2 pb-1 text-xs text-warning">
          {dateHint}
        </p>
      ) : null}
    </form>
  );
}

export function MarketplaceSearchBar({
  className,
  target = "cars",
  datesOpen,
  onDatesOpenChange,
}: MarketplaceSearchBarProps) {
  const searchParams = useSearchParams();
  const locationParam = searchParams.get(SearchParams.LOCATION);
  const fromParam = searchParams.get(SearchParams.FROM) ?? "";
  const toParam = searchParams.get(SearchParams.TO) ?? "";
  const viewParam = searchParams.get(SearchParams.VIEW) ?? "";

  return (
    <MarketplaceSearchForm
      key={`${locationParam ?? ""}|${fromParam}|${toParam}|${viewParam}|${target}`}
      className={className}
      initialLocation={resolveCitySlug(locationParam)}
      initialFrom={fromParam}
      initialTo={toParam}
      view={viewParam || undefined}
      target={target}
      datesOpen={datesOpen}
      onDatesOpenChange={onDatesOpenChange}
    />
  );
}

export function MarketplaceSearchBarFallback({
  className,
  target = "cars",
}: MarketplaceSearchBarProps) {
  return (
    <div
      className={cn(
        "marketplace-search-card min-w-0 w-full rounded-2xl p-2 md:p-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center">
        <Skeleton className="h-11 w-full md:flex-1" />
        {target === "cars" ? (
          <>
            <Skeleton className="h-11 w-full md:flex-1" />
            <Skeleton className="h-11 w-full md:flex-1" />
          </>
        ) : null}
        <Skeleton className="h-11 w-full md:w-28" />
      </div>
    </div>
  );
}
