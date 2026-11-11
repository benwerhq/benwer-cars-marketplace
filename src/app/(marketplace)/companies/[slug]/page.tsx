import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { HydrationBoundary } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import { MarketplaceHeader } from "@/components/layout/MarketplaceHeader";
import { CompanyBanner } from "@/components/layout/CompanyBanner";
import { Footer } from "@/components/layout/Footer";
import { CarListView } from "@/components/features/CarListView";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoadError } from "@/components/ui/PageLoadError";
import { companiesApi } from "@/services/api";
import { NavRoutes } from "@/enums";
import { ApiError } from "@/lib/errors";
import { logError } from "@/lib/logger";
import { appendSearchParams } from "@/lib/marketplaceSearch";
import { buildCompanySiteHref } from "@/lib/companySite";
import {
  prefetchCompanyFleetState,
  searchRecordToURLSearchParams,
} from "@/lib/prefetchCompanyFleet";
import { buildPageMetadata } from "@/lib/seo";
import { parseVehicleFilters } from "@/lib/vehicleFilters";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const tMeta = await getTranslations("seo");
  const tBrand = await getTranslations("brand");
  const path = `/companies/${slug}`;

  try {
    const company = await companiesApi.getBySlug(slug);
    const description =
      company.description ??
      (company.location
        ? tMeta("companyDescription", {
            name: company.name,
            location: company.location,
          })
        : tMeta("companyDescriptionPlain", { name: company.name }));

    return buildPageMetadata({
      title: tMeta("companyTitle", { name: company.name }),
      description,
      path,
      siteName: tBrand("name"),
      locale,
    });
  } catch {
    return buildPageMetadata({
      title: tMeta("companyFallback"),
      description: tBrand("name"),
      path,
      siteName: tBrand("name"),
      locale,
    });
  }
}

async function CompanyPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const t = await getTranslations("companies");

  let company = null;
  let companyMissing = false;
  let companyUnavailable = false;
  try {
    company = await companiesApi.getBySlug(slug);
  } catch (error) {
    companyMissing =
      error instanceof ApiError && error.code === "company.not_found";
    companyUnavailable = !companyMissing;
    logError(error, { context: "company_detail", slug });
  }

  if (companyMissing) {
    return (
      <>
        <MarketplaceHeader />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-16 md:px-6 lg:px-8">
          <EmptyState
            icon={<Building2 size={28} />}
            title={t("notFoundTitle")}
            description={t("notFoundDescription")}
            actionLabel={t("backToList")}
            actionHref={NavRoutes.COMPANIES}
          />
        </main>
        <Footer />
      </>
    );
  }

  if (companyUnavailable || !company) {
    return (
      <>
        <MarketplaceHeader />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-16 md:px-6 lg:px-8">
          <PageLoadError
            title={t("loadErrorTitle")}
            description={t("loadErrorDescription")}
          />
        </main>
        <Footer />
      </>
    );
  }

  const filters = parseVehicleFilters(searchRecordToURLSearchParams(query));
  const dehydratedState = await prefetchCompanyFleetState(company, filters);

  return (
    <>
      <MarketplaceHeader />
      <CompanyBanner
        name={company.name}
        logoUrl={company.branding.logoUrl}
        description={company.description}
        location={company.location}
        websiteHref={buildCompanySiteHref({
          slug,
          websiteUrl: company.websiteUrl,
        })}
        websiteLabel={t("visitWebsite")}
        email={company.email}
        phone={company.phone}
        contactLabel={t("contact")}
        backHref={appendSearchParams(NavRoutes.COMPANIES, {
          location:
            typeof query.location === "string" ? query.location : undefined,
        })}
        backLabel={t("backToList")}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6 lg:px-8">
        <HydrationBoundary state={dehydratedState}>
          <CarListView
            companySlug={slug}
            hrefBase={buildCompanySiteHref({
              slug,
              websiteUrl: company.websiteUrl,
              path: "/cars",
            })}
            showDirectoryEmptyAction
          />
        </HydrationBoundary>
      </main>
      <Footer />
    </>
  );
}

export default CompanyPage;
