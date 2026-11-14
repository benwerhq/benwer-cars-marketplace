import type { LogoPair } from "@/types/company";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GuestAppBadges } from "@/components/features/GuestAppBadges";
import { ReservationStatus } from "@/components/features/ReservationStatus";
import { loadPublicSite, previewFromQuery } from "@/lib/loadPublicSite";
import { isTenantHostRequest, publicSiteHomeHref } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";
import { siteHeaderLogos } from "@/lib/siteContent";

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

  const tApp = await getTranslations("guestApp");
  let companyName = slug;
  let showGuestApp = false;
  let logos: LogoPair = { logoUrl: null, logoDarkUrl: null };
  try {
    const site = await loadPublicSite(slug, preview);
    companyName = site.company.name;
    showGuestApp = site.content.app.benwerApp;
    logos = siteHeaderLogos(site.content, site.company.branding);
  } catch {
    companyName = slug;
  }

  const homeHref = publicSiteHomeHref(
    slug,
    isTenantHostRequest(await headers()),
    { preview },
  );

  return (
    <>
      <SiteHeader
        companyName={companyName}
        {...logos}
        homeHref={homeHref}
        cartSlug={slug}
        fleetHref={`${homeHref}#fleet`}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 md:px-6 md:py-12">
        <ReservationStatus
          token={token}
          companySlug={slug}
          browseHref={homeHref}
          allowWithdraw
        />
        {showGuestApp ? (
          <GuestAppBadges className="mt-10" text={tApp("bookingText")} />
        ) : null}
      </main>
      <SiteFooter companyName={companyName} homeHref={homeHref} />
    </>
  );
}

export default CompanySiteBookingStatusPage;
