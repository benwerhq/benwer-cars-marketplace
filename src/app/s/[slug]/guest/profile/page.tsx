import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { GuestProfileView } from "@/components/features/GuestProfileView";
import { SiteGuestShell } from "@/components/layout/SiteGuestShell";
import { loadPublicSite, previewFromQuery } from "@/lib/loadPublicSite";
import {
  companySlugFromSite,
  isTenantHostRequest,
  publicSiteHomeHref,
  siteGuestProfilePath,
} from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("guest");
  const tBrand = await getTranslations("brand");

  return buildPageMetadata({
    title: t("profileTitle"),
    description: t("profileMeta"),
    path: siteGuestProfilePath(slug),
    siteName: tBrand("name"),
    locale,
    noIndex: true,
  });
}

async function CompanySiteGuestProfilePage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const preview = previewFromQuery(query);

  let site;
  try {
    site = await loadPublicSite(slug, preview);
  } catch {
    notFound();
  }

  const homeHref = publicSiteHomeHref(site.slug, isTenantHostRequest(await headers()), {
    preview,
  });

  return (
    <SiteGuestShell site={site} preview={preview}>
      <GuestProfileView
        companySlug={companySlugFromSite(site)}
        companyName={site.company.name}
        homeHref={homeHref}
      />
    </SiteGuestShell>
  );
}

export default CompanySiteGuestProfilePage;
