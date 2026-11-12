import type { Metadata } from "next";
import { headers } from "next/headers";
import { Car } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BookingView } from "@/components/features/BookingView";
import { SitePausedNotice } from "@/components/features/SitePausedNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { vehiclesApi } from "@/services/api";
import { SearchParams } from "@/enums";
import { loadPublicSite, previewFromQuery } from "@/lib/loadPublicSite";
import { platformBookingHref } from "@/lib/canonicalUrl";
import {
  canAcceptBookings,
  companySlugFromSite,
  guestLinksFromHomeHref,
  isTenantHostRequest,
  parseDriverAge,
  publicSiteHref,
  queryString,
  publicSiteHomeHref,
  SITE_CHANNEL,
  siteBookHref,
  siteCarPath,
  withSiteQuery,
} from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";
import { siteHeaderLogo } from "@/lib/siteContent";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("booking");
  const tBrand = await getTranslations("brand");

  return buildPageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: `/s/${slug}/book`,
    siteName: tBrand("name"),
    locale,
    noIndex: true,
  });
}

async function CompanySiteBookPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const preview = previewFromQuery(query);
  const t = await getTranslations("booking");
  const carId = typeof query[SearchParams.CAR_ID] === "string"
    ? query[SearchParams.CAR_ID]
    : typeof query.carId === "string"
      ? query.carId
      : "";
  const from = typeof query.from === "string" ? query.from : undefined;
  const to = typeof query.to === "string" ? query.to : undefined;
  const branch =
    typeof query[SearchParams.BRANCH] === "string"
      ? query[SearchParams.BRANCH]
      : undefined;

  const returnParam =
    typeof query[SearchParams.RETURN_BRANCH] === "string"
      ? query[SearchParams.RETURN_BRANCH]
      : undefined;
  const ageParam = queryString(query, SearchParams.DRIVER_AGE);
  const driverAge = ageParam ? parseDriverAge(ageParam) : undefined;

  let site = null;
  try {
    site = await loadPublicSite(slug, preview);
  } catch {
    site = null;
  }

  const onTenantHost = isTenantHostRequest(await headers());
  const homeHref = site
    ? publicSiteHomeHref(site.slug, onTenantHost, { preview })
    : publicSiteHomeHref(slug, onTenantHost);

  if (!site) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <EmptyState
          title={t("missingTitle")}
          description={t("missingDescription")}
        />
      </main>
    );
  }

  const companySlug = companySlugFromSite(site);

  if (!carId) {
    return (
      <>
        <SiteHeader
          companyName={site.company.name}
          logoUrl={siteHeaderLogo(site.content, site.company.branding.logoUrl)}
          homeHref={homeHref}
          cartSlug={slug}
          fleetHref={`${homeHref}#fleet`}
        />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          <EmptyState
            title={t("missingTitle")}
            description={t("missingDescription")}
            actionLabel={t("browseCars")}
            actionHref={homeHref}
          />
        </main>
        <SiteFooter companyName={site.company.name} homeHref={homeHref} />
      </>
    );
  }

  if (!canAcceptBookings(site)) {
    return (
      <>
        <SiteHeader
          companyName={site.company.name}
          logoUrl={siteHeaderLogo(site.content, site.company.branding.logoUrl)}
          homeHref={homeHref}
          cartSlug={slug}
          fleetHref={`${homeHref}#fleet`}
        />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          <SitePausedNotice />
        </main>
        <SiteFooter companyName={site.company.name} homeHref={homeHref} />
      </>
    );
  }

  let vehicle;
  try {
    vehicle = await vehiclesApi.getById(companySlug, carId, SITE_CHANNEL);
  } catch {
    return (
      <>
        <SiteHeader
          companyName={site.company.name}
          logoUrl={siteHeaderLogo(site.content, site.company.branding.logoUrl)}
          homeHref={homeHref}
          cartSlug={slug}
          fleetHref={`${homeHref}#fleet`}
        />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          <EmptyState
            icon={<Car size={40} />}
            title={t("vehicleMissingTitle")}
            description={t("vehicleMissingDescription")}
            actionLabel={t("viewFleet")}
            actionHref={homeHref}
          />
        </main>
        <SiteFooter companyName={site.company.name} homeHref={homeHref} />
      </>
    );
  }

  const returnLocation = site.allowDifferentReturn
    ? site.branches.find((item) => item.id === returnParam) ?? null
    : null;
  const returnBranch = returnLocation?.id;
  const carHref = publicSiteHref(
    withSiteQuery(siteCarPath(site.slug, vehicle.id), {
      from,
      to,
      branch,
      returnBranch,
      driverAge,
      preview,
    }),
    site.slug,
    onTenantHost,
  );

  return (
    <>
      <SiteHeader
        companyName={site.company.name}
        logoUrl={siteHeaderLogo(site.content, site.company.branding.logoUrl)}
        homeHref={homeHref}
        cartSlug={slug}
        fleetHref={`${homeHref}#fleet`}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-28 md:px-6 lg:px-8 lg:pb-16">
        <BookingView
          vehicle={vehicle}
          company={site.company}
          companySlug={companySlug}
          defaultFrom={from}
          defaultTo={to}
          carHref={carHref}
          requireTerms
          showInsurance
          bookingMode={site.bookingMode}
          bookingsEnabled
          channel={SITE_CHANNEL}
          returnLocation={returnLocation}
          guestSignInHref={guestLinksFromHomeHref(homeHref).signIn}
          confirmationBaseUrl={platformBookingHref("").replace(/\/$/, "")}
          bookHrefBase={publicSiteHref(
            siteBookHref({
              slug: site.slug,
              carId: vehicle.id,
              branch,
              returnBranch,
              driverAge,
              preview,
            }),
            site.slug,
            onTenantHost,
          )}
        />
      </main>
      <SiteFooter companyName={site.company.name} homeHref={homeHref} />
    </>
  );
}

export default CompanySiteBookPage;
