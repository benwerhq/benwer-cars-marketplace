import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { HydrationBoundary } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteEditBanner } from "@/components/layout/SiteEditBanner";
import { SiteEditSection } from "@/components/layout/SiteEditSection";
import { SiteHero } from "@/components/features/SiteHero";
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
  SITE_CHANNEL,
  canAcceptBookings,
  companySlugFromSite,
  isSitePaused,
  siteHomePath,
  withSiteQuery,
} from "@/lib/site";
import { localizedText } from "@/lib/localizedCopy";
import { isSiteEditMode, parseEditFlag } from "@/lib/siteEdit";
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
  const path = siteHomePath(slug);

  try {
    const site = await loadPublicSite(slug, preview);
    const headline =
      localizedText(site.headline, locale) ||
      t("defaultHeadline", { name: site.company.name });
    return buildPageMetadata({
      title: site.company.name,
      description: localizedText(site.intro, locale) || headline,
      path,
      siteName: site.company.name,
      locale,
      noIndex:
        Boolean(preview) ||
        parseEditFlag(query.edit) ||
        site.status !== "published",
    });
  } catch {
    return buildPageMetadata({
      title: t("notFoundTitle"),
      description: t("notFoundDescription"),
      path,
      siteName: t("notFoundTitle"),
      locale,
      noIndex: true,
    });
  }
}

async function CompanySiteHomePage({ params, searchParams }: Props) {
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
    logError(error, { context: "site_home", slug });
  }

  if (!site) {
    return (
      <>
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
      </>
    );
  }

  const companySlug = companySlugFromSite(site);
  const editMode = isSiteEditMode({
    isPreview: site.isPreview,
    preview,
    edit: parseEditFlag(query.edit),
  });
  const homeHref = withSiteQuery(siteHomePath(site.slug), {
    preview,
    edit: editMode,
  });
  const fleetHref = `${homeHref}#fleet`;
  const dehydratedState = await prefetchCompanyFleetState(site.company, {
    from: typeof query.from === "string" ? query.from : undefined,
    to: typeof query.to === "string" ? query.to : undefined,
    branchId: typeof query[SearchParams.BRANCH] === "string"
      ? query[SearchParams.BRANCH]
      : undefined,
    channel: SITE_CHANNEL,
  });

  return (
    <>
      {editMode ? <SiteEditBanner /> : null}
      <SiteHeader
        companyName={site.company.name}
        logoUrl={site.company.branding.logoUrl}
        homeHref={homeHref}
        fleetHref={fleetHref}
      />
      <SiteHero site={site} editMode={editMode} />
      <main
        id="fleet"
        className="mx-auto flex w-full max-w-7xl scroll-mt-20 flex-col gap-8 px-4 py-8 md:px-6 lg:px-8"
      >
        {isSitePaused(site) ? <SitePausedNotice /> : null}
        <SiteEditSection section={SiteEditSectionId.SEARCH} enabled={editMode}>
          <SiteSearchForm
            slug={site.slug}
            branches={site.branches}
            defaultFrom={typeof query.from === "string" ? query.from : ""}
            defaultTo={typeof query.to === "string" ? query.to : ""}
            defaultBranch={
              typeof query[SearchParams.BRANCH] === "string"
                ? query[SearchParams.BRANCH]
                : ""
            }
            preview={preview}
            edit={editMode}
            disabled={!canAcceptBookings(site)}
          />
        </SiteEditSection>
        <SiteEditSection section={SiteEditSectionId.FLEET} enabled={editMode}>
          <HydrationBoundary state={dehydratedState}>
            <CarListView
              companySlug={companySlug}
              hrefBase={`${siteHomePath(site.slug)}/cars`}
              showDateSearch={false}
              filterByAvailability
              showDirectoryEmptyAction={false}
              channel={SITE_CHANNEL}
            />
          </HydrationBoundary>
        </SiteEditSection>
        {editMode ? (
          <div className="flex flex-col gap-4">
            <SiteEditSection section={SiteEditSectionId.BRANCHES} enabled>
              <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  {t("editSection.branches")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {site.branches.length > 0
                    ? site.branches.map((branch) => branch.name).join(" · ")
                    : t("editBranchesEmpty")}
                </p>
              </div>
            </SiteEditSection>
            <SiteEditSection section={SiteEditSectionId.RULES} enabled>
              <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  {t("editSection.rules")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("editRulesHint")}
                </p>
              </div>
            </SiteEditSection>
            <SiteEditSection section={SiteEditSectionId.DOMAIN} enabled>
              <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  {t("editSection.domain")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("editDomainHint")}
                </p>
              </div>
            </SiteEditSection>
          </div>
        ) : null}
      </main>
      <SiteFooter companyName={site.company.name} homeHref={homeHref} />
    </>
  );
}

export default CompanySiteHomePage;
