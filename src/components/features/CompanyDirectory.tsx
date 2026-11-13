"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { List, MapPinned } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { CompaniesMap } from "./CompaniesMap";
import { CompanyGrid, CompanyGridSkeleton } from "./CompanyGrid";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { isProvinceWideLocation } from "@/data/malagaCities";
import { NavRoutes, SearchParams } from "@/enums";
import { toCompanyMapPins } from "@/lib/companyMap";
import { locationLabelFromSlug } from "@/lib/locationOptions";
import { getErrorKey } from "@/lib/errors";
import { buildCompanySiteHref } from "@/lib/companySite";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Company } from "@/types/company";
import { cn } from "@/lib/utils";

interface CompanyDirectoryProps {
  companies: Company[] | undefined;
  isPending: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  location: string | null;
  branchName?: string | null;
  initialSelectedSlug?: string | null;
  hasFilters?: boolean;
}

export function CompanyDirectory({
  companies,
  isPending,
  isError,
  error,
  onRetry,
  location,
  branchName = null,
  initialSelectedSlug = null,
  hasFilters = Boolean(location),
}: CompanyDirectoryProps) {
  const t = useTranslations("map");
  const tCompanies = useTranslations("companies");
  const tRoot = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    initialSelectedSlug,
  );
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);

  const showMapPane =
    isDesktop || searchParams.get(SearchParams.VIEW) === "map";
  const cityLabel =
    location && !isProvinceWideLocation(location)
      ? locationLabelFromSlug(location, locale)
      : null;

  const searchFrom = searchParams.get(SearchParams.FROM) || undefined;
  const searchTo = searchParams.get(SearchParams.TO) || undefined;
  const pins = useMemo(
    () =>
      toCompanyMapPins(companies ?? [], (company) =>
        buildCompanySiteHref({
          slug: company.slug,
          websiteUrl: company.websiteUrl,
          from: searchFrom,
          to: searchTo,
        }),
      ),
    [companies, searchFrom, searchTo],
  );

  function setMobileView(view: "list" | "map") {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "map") {
      params.set(SearchParams.VIEW, "map");
    } else {
      params.delete(SearchParams.VIEW);
    }

    const query = params.toString();
    router.replace(
      query ? `${NavRoutes.COMPANIES}?${query}` : NavRoutes.COMPANIES,
      {
        scroll: false,
      },
    );
  }

  function companyHref(company: Company): string {
    return buildCompanySiteHref({
      slug: company.slug,
      websiteUrl: company.websiteUrl,
      from: searchFrom,
      to: searchTo,
    });
  }

  const count = companies?.length ?? 0;
  const resultsLabel = branchName
    ? t("resultsAtBranch", { count, branch: branchName })
    : cityLabel
      ? t("resultsInCity", {
          count,
          city: cityLabel,
        })
      : t("resultsCount", { count });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {isPending ? t("loading") : resultsLabel}
        </p>
        <div
          className="grid grid-cols-2 rounded-lg border border-border bg-surface p-1 lg:hidden"
          role="group"
          aria-label={t("viewToggleAria")}
        >
          <Button
            type="button"
            variant={showMapPane ? "ghost" : "secondary"}
            size="sm"
            aria-pressed={!showMapPane}
            className="min-h-11"
            onClick={() => setMobileView("list")}
          >
            <List size={16} aria-hidden />
            {t("listLabel")}
          </Button>
          <Button
            type="button"
            variant={showMapPane ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={showMapPane}
            className="min-h-11"
            onClick={() => setMobileView("map")}
          >
            <MapPinned size={16} aria-hidden />
            {t("mapLabel")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:items-start">
        <div
          className={cn(
            "h-[min(26rem,58dvh)] lg:sticky lg:top-20 lg:h-[calc(100dvh-8rem)]",
            !isDesktop && !showMapPane && "hidden",
          )}
        >
          <CompaniesMap
            pins={pins}
            selectedSlug={selectedSlug}
            highlightedSlug={highlightedSlug}
            locationSlug={isProvinceWideLocation(location) ? null : location}
            isPending={isPending}
            isError={isError}
            error={error}
            onRetry={onRetry}
            onSelect={setSelectedSlug}
            onClose={() => setSelectedSlug(null)}
            className="h-full"
          />
        </div>

        <div className={cn("min-w-0", !isDesktop && showMapPane && "hidden")}>
          {isPending ? (
            <CompanyGridSkeleton count={4} className="lg:grid-cols-1" />
          ) : isError ? (
            <ErrorState message={tRoot(getErrorKey(error))} onRetry={onRetry} />
          ) : (
            <CompanyGrid
              companies={companies ?? []}
              buildHref={companyHref}
              selectedSlug={selectedSlug}
              onHighlight={setHighlightedSlug}
              fleetHint={(company) =>
                company.vehicleCount == null
                  ? t("fleetHintUnknown")
                  : t("fleetHint", { count: company.vehicleCount })
              }
              viewFleetLabel={tCompanies("viewFleet")}
              onClearFilters={
                hasFilters
                  ? () => router.replace(NavRoutes.COMPANIES)
                  : undefined
              }
              className="lg:grid-cols-1"
            />
          )}
        </div>
      </div>
    </div>
  );
}
