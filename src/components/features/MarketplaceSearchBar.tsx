"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { BranchCombobox } from "./BranchCombobox";
import { CityCombobox } from "./CityCombobox";
import { DateRangePopover } from "./DateRangePopover";
import { DriverAgeSelect } from "./DriverAgeSelect";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/Switch";
import { useCompanies } from "@/hooks/useCompanies";
import {
  branchOptionsFromCompanies,
  companyForBranch,
  returnBranchOptions,
} from "@/lib/branchOptions";
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
const DATES_HINT_ID = "marketplace-dates-hint";
const DIVIDER_CLASS = "hidden w-px self-stretch bg-border md:my-2 md:block";

function MarketplaceSearchForm({
  className,
  initialLocation,
  initialFrom,
  initialTo,
  initialDriverAge,
  initialBranch,
  initialReturnBranch,
  view,
  target = "cars",
}: MarketplaceSearchBarProps & {
  initialBranch: string;
  initialReturnBranch: string;
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
  const [branch, setBranch] = useState(initialBranch);
  const [returnBranch, setReturnBranch] = useState(initialReturnBranch);
  const [differentReturn, setDifferentReturn] = useState(
    Boolean(initialReturnBranch),
  );
  const locale = useLocale();
  const [isSearching, startSearch] = useTransition();
  const [datesOpen, setDatesOpen] = useState(false);
  const [datesMissing, setDatesMissing] = useState(false);
  const hasDates = hasCompleteSearchDates(from, to);
  const isCars = target === "cars";
  const companiesQuery = useCompanies();
  const companies = companiesQuery.data ?? [];
  const branchOptions = branchOptionsFromCompanies(companies, locale);
  const returnOptions = returnBranchOptions(
    companyForBranch(companies, branch),
  );
  const canReturnElsewhere = isCars && returnOptions.length > 0;
  const returnElsewhere =
    canReturnElsewhere && differentReturn && Boolean(returnBranch);

  function changeBranch(next: string) {
    setBranch(next);
    const nextReturns = returnBranchOptions(companyForBranch(companies, next));
    if (!nextReturns.some((option) => option.id === returnBranch)) {
      setReturnBranch("");
      setDifferentReturn(false);
    }
  }

  function toggleDifferentReturn(next: boolean) {
    setDifferentReturn(next);
    if (next && !returnBranch) {
      setReturnBranch(
        returnOptions.find((option) => option.id !== branch)?.id ?? "",
      );
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isCars) {
      startSearch(() =>
        router.push(
          buildCompaniesSearchHref({
            location: location || DEFAULT_CITY_SLUG,
            from: hasDates ? from : undefined,
            to: hasDates ? to : undefined,
            view,
          }),
        ),
      );
      return;
    }
    if (!hasDates) {
      setDatesMissing(true);
      setDatesOpen(true);
      return;
    }

    const next = applyVehicleFilters(searchParams, {
      ...parseVehicleFilters(searchParams),
      from: hasDates ? from : undefined,
      to: hasDates ? to : undefined,
      branchId: branch || undefined,
    });
    next.set(SearchParams.LOCATION, location || DEFAULT_CITY_SLUG);
    if (returnElsewhere && returnBranch !== branch) {
      next.set(SearchParams.RETURN_BRANCH, returnBranch);
    } else {
      next.delete(SearchParams.RETURN_BRANCH);
    }
    next.set(SearchParams.DRIVER_AGE, driverAge);
    startSearch(() => router.push(`${NavRoutes.CARS}?${next.toString()}`));
  }

  function changeDates(next: { from: string; to: string }) {
    setFrom(next.from);
    setTo(next.to);
    if (hasCompleteSearchDates(next.from, next.to)) {
      setDatesMissing(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={t("submit")}
      className={cn(CARD_CLASS, className)}
    >
      {isCars ? (
        <div
          className={cn(TOP_BAR_CLASS, canReturnElsewhere && "justify-between")}
        >
          {canReturnElsewhere ? (
            <label
              htmlFor="marketplace-different-return"
              className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
            >
              <Switch
                id="marketplace-different-return"
                checked={differentReturn}
                onCheckedChange={toggleDifferentReturn}
              />
              {t("differentReturn")}
            </label>
          ) : null}
          <DriverAgeSelect
            id="marketplace-driver-age"
            value={driverAge}
            onChange={setDriverAge}
          />
        </div>
      ) : null}
      <div className={ROW_CLASS}>
        <div className="min-w-0 md:flex-1">
          {isCars ? (
            <BranchCombobox
              label={t("locationLabel")}
              value={branch}
              options={branchOptions}
              onChange={changeBranch}
              anyLabel={t("allLocations")}
              anyHint={t("branchAnyHint")}
              loading={companiesQuery.isPending}
            />
          ) : (
            <CityCombobox value={location} onChange={setLocation} />
          )}
        </div>
        {canReturnElsewhere && differentReturn ? (
          <>
            <span aria-hidden className={DIVIDER_CLASS} />
            <div className="min-w-0 md:flex-1">
              <BranchCombobox
                label={t("returnLocationLabel")}
                value={returnBranch}
                options={returnOptions}
                onChange={setReturnBranch}
              />
            </div>
          </>
        ) : null}
        {isCars ? (
          <>
            <span aria-hidden className={DIVIDER_CLASS} />
            <div className="min-w-0 md:flex-[1.6]">
              <DateRangePopover
                from={from}
                to={to}
                onChange={changeDates}
                required
                invalid={datesMissing}
                open={datesOpen}
                onOpenChange={setDatesOpen}
                describedBy={datesMissing ? DATES_HINT_ID : undefined}
              />
            </div>
          </>
        ) : null}
        <button
          type="submit"
          aria-busy={isSearching}
          className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:ml-2 md:h-16 md:w-16 md:px-0"
        >
          {isSearching ? (
            <Loader2
              size={22}
              strokeWidth={2.25}
              className="animate-spin motion-reduce:animate-none"
              aria-hidden
            />
          ) : (
            <Search size={22} strokeWidth={2.25} aria-hidden />
          )}
          <span className="md:sr-only">{t("submit")}</span>
        </button>
      </div>
      {datesMissing ? (
        <p
          id={DATES_HINT_ID}
          role="alert"
          className="px-5 pb-3 text-sm font-medium text-warning md:px-6"
        >
          {t("datesRequired")}
        </p>
      ) : null}
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
  const branchParam = searchParams.get(SearchParams.BRANCH) ?? "";
  const returnParam = searchParams.get(SearchParams.RETURN_BRANCH) ?? "";

  return (
    <MarketplaceSearchForm
      key={`${locationParam ?? ""}|${fromParam}|${toParam}|${viewParam}|${ageParam ?? ""}|${branchParam}|${returnParam}|${target}`}
      className={className}
      initialLocation={resolveCitySlug(locationParam)}
      initialFrom={fromParam}
      initialTo={toParam}
      initialDriverAge={parseDriverAge(ageParam)}
      initialBranch={branchParam}
      initialReturnBranch={returnParam}
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
