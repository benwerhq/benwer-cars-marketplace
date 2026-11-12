import type { Metadata } from "next";
import { headers } from "next/headers";
import { Building2 } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteDraftLogoProvider } from "@/context/SiteDraftLogoProvider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteEditBanner } from "@/components/layout/SiteEditBanner";
import { OwnerHomeRoot } from "@/components/features/OwnerHomeRoot";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoadError } from "@/components/ui/PageLoadError";
import { NavRoutes, SearchParams, SiteSectionId } from "@/enums";
import { ApiError } from "@/lib/errors";
import { logError } from "@/lib/logger";
import { loadPublicSite, previewFromQuery } from "@/lib/loadPublicSite";
import { prefetchCompanyFleetState } from "@/lib/prefetchCompanyFleet";
import {
  SITE_CHANNEL,
  companySlugFromSite,
  isTenantHostRequest,
  publicSiteHomeHref,
  siteHomePath,
} from "@/lib/site";
import { localizedText } from "@/lib/localizedCopy";
import { isSiteEditMode, parseEditFlag } from "@/lib/siteEdit";
import { siteCanonicalPageUrl } from "@/lib/canonicalUrl";
import { buildPageMetadata } from "@/lib/seo";
import { visibleSections, siteHeaderLogo } from "@/lib/siteContent";

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
      canonicalUrl: siteCanonicalPageUrl(site.canonicalUrl, path, site.slug),
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
  const onTenantHost = isTenantHostRequest(await headers());
  const homeHref = publicSiteHomeHref(site.slug, onTenantHost, {
    preview,
    edit: editMode,
  });
  const fleetHref = `${homeHref}#fleet`;
  const phone = site.showPhone ? site.company.phone : null;
  const email = site.showEmail ? site.company.email : null;
  const navSections = visibleSections(site.content, {
    branchCount: site.branches.length,
    hasPhone: Boolean(phone),
    hasEmail: Boolean(email),
  });
  const headerSections = navSections.filter((id) => NAV_SECTIONS.includes(id));
  const footerSections = navSections.filter(
    (id) => NAV_SECTIONS.includes(id) || id === SiteSectionId.APP,
  );
  const dehydratedState = await prefetchCompanyFleetState(site.company, {
    from: typeof query.from === "string" ? query.from : undefined,
    to: typeof query.to === "string" ? query.to : undefined,
    branchId: typeof query[SearchParams.BRANCH] === "string"
      ? query[SearchParams.BRANCH]
      : undefined,
    channel: SITE_CHANNEL,
  });

  return (
    <SiteDraftLogoProvider>
      {editMode ? <SiteEditBanner /> : null}
      <SiteHeader
        companyName={site.company.name}
        logoUrl={siteHeaderLogo(site.content, site.company.branding.logoUrl)}
        homeHref={homeHref}
        fleetHref={fleetHref}
        sections={headerSections}
        phone={phone}
      />
      <OwnerHomeRoot
        site={site}
        companySlug={companySlug}
        homeHref={homeHref}
        preview={preview}
        from={typeof query.from === "string" ? query.from : ""}
        to={typeof query.to === "string" ? query.to : ""}
        branch={
          typeof query[SearchParams.BRANCH] === "string"
            ? query[SearchParams.BRANCH]
            : ""
        }
        returnBranch={
          typeof query[SearchParams.RETURN_BRANCH] === "string"
            ? query[SearchParams.RETURN_BRANCH]
            : ""
        }
        dehydratedState={dehydratedState}
      />
      <SiteFooter
        companyName={site.company.name}
        homeHref={homeHref}
        description={site.company.description}
        sections={footerSections}
        contact={{ phone, email, whatsapp: site.content.contact.whatsapp }}
        payments={site.content.contact.payments}
      />
    </SiteDraftLogoProvider>
  );
}

const NAV_SECTIONS: SiteSectionId[] = [
  SiteSectionId.REVIEWS,
  SiteSectionId.BRANCHES,
  SiteSectionId.FAQ,
  SiteSectionId.CONTACT,
];

export default CompanySiteHomePage;
