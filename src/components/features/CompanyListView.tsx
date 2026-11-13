"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyDirectory } from "./CompanyDirectory";
import { CompanyGridSkeleton, CompanyGridView } from "./CompanyGrid";
import {
  MarketplaceSearchBar,
  MarketplaceSearchBarFallback,
} from "./MarketplaceSearchBar";
import { NavRoutes, SearchParams } from "@/enums";
import { companyForBranch } from "@/lib/branchOptions";
import type { Company } from "@/types/company";

interface CompanyListViewProps {
  showSearchBar?: boolean;
  limit?: number;
  initialCompanies?: Company[];
}

function FeaturedCompanyResults({
  limit,
  initialCompanies,
}: {
  limit?: number;
  initialCompanies?: Company[];
}) {
  const t = useTranslations("companies");
  const { data, isPending, isError, error, refetch } = useCompanies();
  // Featured companies are only the ones with public cars to look at.
  const companies = (data ?? initialCompanies)?.filter(
    (company) => company.vehicleCount !== 0,
  );
  const waiting = isPending && !initialCompanies;

  return (
    <CompanyGridView
      companies={limit && companies ? companies.slice(0, limit) : companies}
      isPending={waiting}
      isError={isError && !companies}
      error={error}
      onRetry={refetch}
      emptyTitle={t("featuredEmpty")}
      emptyHint={t("featuredEmptyHint")}
      emptyActionLabel={t("browseCars")}
      emptyActionHref={NavRoutes.CARS}
    />
  );
}

function SearchableCompanyResults() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get(SearchParams.BRANCH);
  const location = branchId ? null : searchParams.get(SearchParams.LOCATION);
  const { data, isPending, isError, error, refetch } = useCompanies(
    location ? { location } : undefined,
  );
  const branchCompany = branchId
    ? companyForBranch(data ?? [], branchId)
    : undefined;
  const branch = branchCompany?.branches.find((item) => item.id === branchId);
  const companies =
    branchId && data ? (branchCompany ? [branchCompany] : []) : data;

  return (
    <div className="flex flex-col gap-6">
      <MarketplaceSearchBar target="companies" />
      <CompanyDirectory
        key={branchId ?? ""}
        companies={companies}
        isPending={isPending}
        isError={isError}
        error={error}
        onRetry={refetch}
        location={location}
        branchName={branch?.name ?? null}
        initialSelectedSlug={branchCompany?.slug ?? null}
        hasFilters={Boolean(location || branchId)}
      />
    </div>
  );
}

export function CompanyListView({
  showSearchBar = true,
  limit,
  initialCompanies,
}: CompanyListViewProps) {
  if (!showSearchBar) {
    return (
      <FeaturedCompanyResults
        limit={limit}
        initialCompanies={initialCompanies}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <MarketplaceSearchBarFallback target="companies" />
          <CompanyGridSkeleton count={limit ?? 6} />
        </div>
      }
    >
      <SearchableCompanyResults />
    </Suspense>
  );
}
