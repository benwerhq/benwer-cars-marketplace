import type { Metadata } from "next";
import { headers } from "next/headers";
import { Building2 } from "lucide-react";
import { HydrationBoundary } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/layout/PageIntro";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteEditSection } from "@/components/layout/SiteEditSection";
import { SitePausedNotice } from "@/components/features/SitePausedNotice";
import { SiteSearchForm } from "@/components/features/SiteSearchForm";
import { CarListView } from "@/components/features/CarListView";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoadError } from "@/components/ui/PageLoadError";
import { NavRoutes, SearchParams, SiteEditSection as SiteEditSectionId } from "@/enums";
import { ApiError } from "@/lib/errors";
import { logError } from "@/lib/logger";
import { loadPublicSite, previewFromQuery } from "@/lib/loadPublicSite";
import { prefetchCompanyFleetState } from "@/lib/prefetchCompanyFleet";
import {
  canAcceptBookings,
  companySlugFromSite,
  isSitePaused,
  isTenantHostRequest,
  publicSiteHomeHref,
  SITE_CHANNEL,
  sitePathFromHome,
  siteSearchPath,
} from "@/lib/site";
import { isSiteEditMode, parseEditFlag } from "@/lib/siteEdit";
import { siteCanonicalPageUrl } from "@/lib/canonicalUrl";
import { buildPageMetadata } from "@/lib/seo";
import { siteHeaderLogos } from "@/lib/siteContent";

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

  const path = siteSearchPath(slug);
  try {
    const site = await loadPublicSite(slug, preview);
    return buildPageMetadata({
      title: t("searchTitle"),
      description: t("searchDescription"),
      path,
      siteName: t("searchTitle"),
      locale,
      canonicalUrl: siteCanonicalPageUrl(site.canonicalUrl, path, site.slug),
      noIndex: Boolean(preview) || parseEditFlag(query.edit),
    });
  } catch {
    return buildPageMetadata({
      title: t("searchTitle"),
      description: t("searchDescription"),
      path,
      siteName: t("searchTitle"),
      locale,
      noIndex: true,
    });
  }
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
  const editMode = isSiteEditMode({
    isPreview: site.isPreview,
    preview,
    edit: parseEditFlag(query.edit),
  });
  const onTenantHost = isTenantHostRequest(await headers());
  const homeHref = publicSiteHomeHref(site.slug, onTenantHost, {
    preview,
    edit: editMode,
  });
  const from = typeof query.from === "string" ? query.from : "";
  const to = typeof query.to === "string" ? query.to : "";
  const branch =
    typeof query[SearchParams.BRANCH] === "string"
      ? query[SearchParams.BRANCH]
      : "";
  const returnBranch =
    typeof query[SearchParams.RETURN_BRANCH] === "string"
      ? query[SearchParams.RETURN_BRANCH]
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
        {...siteHeaderLogos(site.content, site.company.branding)}
        homeHref={homeHref}
        cartSlug={slug}
        fleetHref={`${homeHref}#fleet`}
        phone={site.showPhone ? site.company.phone : null}
      />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">
        <PageIntro
          title={t("searchTitle")}
          description={t("searchDescription")}
        />
        {isSitePaused(site) ? <SitePausedNotice compact /> : null}
        <SiteEditSection section={SiteEditSectionId.SEARCH} enabled={editMode}>
          <SiteSearchForm
            homeHref={homeHref}
            branches={site.branches}
            defaultFrom={from}
            defaultTo={to}
            defaultBranch={branch}
            defaultReturnBranch={returnBranch}
            allowDifferentReturn={site.allowDifferentReturn}
            preview={preview}
            edit={editMode}
            disabled={!canAcceptBookings(site)}
            variant="hero"
          />
        </SiteEditSection>
        <SiteEditSection section={SiteEditSectionId.FLEET} enabled={editMode}>
          <HydrationBoundary state={dehydratedState}>
            <CarListView
              layout="rows"
              companySlug={companySlug}
              hrefBase={sitePathFromHome(homeHref, "/cars")}
              showDateSearch={false}
              filterByAvailability
              channel={SITE_CHANNEL}
            />
          </HydrationBoundary>
        </SiteEditSection>
      </main>
      <SiteFooter companyName={site.company.name} homeHref={homeHref} />
    </>
  );
}

export default CompanySiteSearchPage;
