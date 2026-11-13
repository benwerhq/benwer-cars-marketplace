import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { OwnerSignInPanel } from "@/components/features/OwnerSignInPanel";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { loadPublicSite, previewFromQuery } from "@/lib/loadPublicSite";
import {
  isTenantHostRequest,
  publicSiteHomeHref,
  siteOwnerPath,
} from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";
import { siteHeaderLogos } from "@/lib/siteContent";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("owner");
  const tBrand = await getTranslations("brand");

  return buildPageMetadata({
    title: t("signInTitle"),
    description: t("signInHint"),
    path: siteOwnerPath(slug),
    siteName: tBrand("name"),
    locale,
    noIndex: true,
  });
}

async function CompanySiteOwnerPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const preview = previewFromQuery(query);

  let site;
  try {
    site = await loadPublicSite(slug, preview);
  } catch {
    notFound();
  }

  const homeHref = publicSiteHomeHref(
    site.slug,
    isTenantHostRequest(await headers()),
    { preview },
  );

  return (
    <>
      <SiteHeader
        companyName={site.company.name}
        {...siteHeaderLogos(site.content, site.company.branding)}
        homeHref={homeHref}
        cartSlug={slug}
        fleetHref={`${homeHref}#fleet`}
      />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-12 md:px-6">
        <OwnerSignInPanel homeHref={homeHref} />
      </main>
      <SiteFooter companyName={site.company.name} homeHref={homeHref} />
    </>
  );
}

export default CompanySiteOwnerPage;
