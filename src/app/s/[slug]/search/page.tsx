import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { HydrationBoundary } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SitePausedNotice } from "@/components/features/SitePausedNotice";
import { SiteSearchForm } from "@/components/features/SiteSearchForm";
import { CarListView } from "@/components/features/CarListView";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoadError } from "@/components/ui/PageLoadError";
import { NavRoutes, SearchParams } from "@/enums";
import { ApiError } from "@/lib/errors";
import { logError } from "@/lib/logger";
import { loadPublicSite, previewFromQuery } from "@/lib/loadPublicSite";
import { prefetchCompanyFleetState } from "@/lib/prefetchCompanyFleet";
import {
  canAcceptBookings,
  companySlugFromSite,
  isSitePaused,
  SITE_CHANNEL,
  siteHomePath,
  siteSearchPath,
  withSiteQuery,
} from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const preview = previewFromQuery(query);
  const locale = await getLocale();
  const t = await getTranslations("site");

  return buildPageMetadata({
    title: t("searchTitle"),
    description: t("searchDescription"),
    path: siteSearchPath(slug),
    siteName: t("searchTitle"),
    locale,
    noIndex: Boolean(preview),
  });
}

async function CompanySiteSearchPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const preview = previewFromQuery(query);
  const t = await getTranslations("site");
  const tNotFound = await getTranslations("notFound");

  let site = null;
  let missing = false;
  let unavailable = false;
  try {
    site = await loadPublicSite(slug, preview);
  } catch (error) {
    missing = error instanceof ApiError && error.status === 404;
    unavailable = !missing;
    logError(error, { context: "site_search", slug });
  }

  if (!site) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-12 md:px-6 lg:px-8">
        {unavailable ? (
          <PageLoadError
            title={t("loadErrorTitle")}
            description={t("loadErrorDescription")}
          />
        ) : (
          <EmptyState
            icon={<Building2 size={28} />}
            title={t("notFoundTitle")}
            description={t("notFoundDescription")}
            actionLabel={tNotFound("action")}
            actionHref={NavRoutes.HOME}
          />
        )}
      </main>
    );
  }

  const companySlug = companySlugFromSite(site);
  const homeHref = withSiteQuery(siteHomePath(site.slug), { preview });
  const from = typeof query.from === "string" ? query.from : "";
  const to = typeof query.to === "string" ? query.to : "";
  const branch =
    typeof query[SearchParams.BRANCH] === "string"
      ? query[SearchParams.BRANCH]
      : "";
  const dehydratedState = await prefetchCompanyFleetState(site.company, {
    from: from || undefined,
    to: to || undefined,
    branchId: branch || undefined,
    channel: SITE_CHANNEL,
  });

  return (
    <>
      <SiteHeader
        companyName={site.company.name}
        logoUrl={site.company.branding.logoUrl}
        homeHref={homeHref}
        fleetHref={`${homeHref}#fleet`}
      />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {t("searchTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("searchDescription")}
          </p>
        </div>
        {isSitePaused(site) ? <SitePausedNotice compact /> : null}
        <SiteSearchForm
          slug={site.slug}
          branches={site.branches}
          defaultFrom={from}
          defaultTo={to}
          defaultBranch={branch}
          preview={preview}
          disabled={!canAcceptBookings(site)}
        />
        <HydrationBoundary state={dehydratedState}>
          <CarListView
            companySlug={companySlug}
            hrefBase={`${siteHomePath(site.slug)}/cars`}
            showDateSearch={false}
            filterByAvailability
            channel={SITE_CHANNEL}
          />
        </HydrationBoundary>
      </main>
      <SiteFooter companyName={site.company.name} homeHref={homeHref} />
    </>
  );
}

export default CompanySiteSearchPage;
