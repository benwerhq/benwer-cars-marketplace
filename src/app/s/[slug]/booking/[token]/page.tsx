import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ReservationStatus } from "@/components/features/ReservationStatus";
import { loadPublicSite, previewFromQuery } from "@/lib/loadPublicSite";
import { siteHomePath, withSiteQuery } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string; token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("reservationStatus");
  const tBrand = await getTranslations("brand");

  return buildPageMetadata({
    title: t("title"),
    description: t("successTitle"),
    path: `/s/${slug}/booking`,
    siteName: tBrand("name"),
    locale,
    noIndex: true,
  });
}

async function CompanySiteBookingStatusPage({ params, searchParams }: Props) {
  const [{ slug, token }, query] = await Promise.all([params, searchParams]);
  const preview = previewFromQuery(query);

  let companyName = slug;
  let logoUrl: string | null = null;
  try {
    const site = await loadPublicSite(slug, preview);
    companyName = site.company.name;
    logoUrl = site.company.branding.logoUrl;
  } catch {
    companyName = slug;
  }

  const homeHref = withSiteQuery(siteHomePath(slug), { preview });

  return (
    <>
      <SiteHeader
        companyName={companyName}
        logoUrl={logoUrl}
        homeHref={homeHref}
        fleetHref={`${homeHref}#fleet`}
      />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 md:px-6">
        <ReservationStatus
          token={token}
          browseHref={homeHref}
          allowWithdraw
        />
      </main>
      <SiteFooter companyName={companyName} homeHref={homeHref} />
    </>
  );
}

export default CompanySiteBookingStatusPage;
