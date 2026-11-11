import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { HydrationBoundary } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CarDetailView } from "@/components/features/CarDetailView";
import { SitePausedNotice } from "@/components/features/SitePausedNotice";
import { JsonLd } from "@/components/seo/JsonLd";
import { vehiclesApi } from "@/services/api";
import { SearchParams } from "@/enums";
import { logError } from "@/lib/logger";
import { loadPublicSite, previewFromQuery } from "@/lib/loadPublicSite";
import { prefetchAvailabilityState } from "@/lib/prefetchAvailability";
import {
  SITE_CHANNEL,
  canAcceptBookings,
  companySlugFromSite,
  isRequestBooking,
  isSitePaused,
  isTenantHostRequest,
  publicSiteHref,
  publicSiteHomeHref,
  siteBookHref,
  siteCarPath,
} from "@/lib/site";
import { siteCanonicalPageUrl } from "@/lib/canonicalUrl";
import { buildPageMetadata, carProductJsonLd } from "@/lib/seo";
import { vehicleImageUrls } from "@/lib/vehicleImage";

interface Props {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const [{ slug, id }, query] = await Promise.all([params, searchParams]);
  const preview = previewFromQuery(query);
  const locale = await getLocale();
  const t = await getTranslations("carDetail");
  const tMeta = await getTranslations("seo");
  const tCars = await getTranslations("cars");
  const path = siteCarPath(slug, id);

  try {
    const site = await loadPublicSite(slug, preview);
    const vehicle = await vehiclesApi.getById(
      companySlugFromSite(site),
      id,
      SITE_CHANNEL,
    );
    return buildPageMetadata({
      title: tMeta("carTitleTenant", {
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
      }),
      description:
        vehicle.description ??
        tMeta("carDescriptionSpecs", {
          brand: vehicle.brand,
          model: vehicle.model,
          seats: vehicle.seats,
          transmission: tCars(`transmission.${vehicle.transmission}`),
        }),
      path,
      siteName: site.company.name,
      locale,
      images: vehicleImageUrls(vehicle),
      canonicalUrl: siteCanonicalPageUrl(site.canonicalUrl, path, site.slug),
      noIndex: Boolean(preview),
    });
  } catch {
    return buildPageMetadata({
      title: t("metaTitle"),
      description: tCars("title"),
      path,
      siteName: t("metaTitle"),
      locale,
      noIndex: true,
    });
  }
}

async function CompanySiteCarPage({ params, searchParams }: Props) {
  const [{ slug, id }, query] = await Promise.all([params, searchParams]);
  const preview = previewFromQuery(query);
  const t = await getTranslations("carDetail");
  const from = typeof query.from === "string" ? query.from : undefined;
  const to = typeof query.to === "string" ? query.to : undefined;
  const branch =
    typeof query[SearchParams.BRANCH] === "string"
      ? query[SearchParams.BRANCH]
      : undefined;

  let site;
  try {
    site = await loadPublicSite(slug, preview);
  } catch {
    notFound();
  }

  const companySlug = companySlugFromSite(site);
  let vehicle;
  try {
    vehicle = await vehiclesApi.getById(companySlug, id, SITE_CHANNEL);
  } catch (error) {
    logError(error, { context: "site_car", slug, id });
    notFound();
  }

  const onTenantHost = isTenantHostRequest(await headers());
  const homeHref = publicSiteHomeHref(site.slug, onTenantHost, { preview });
  const dehydratedState = await prefetchAvailabilityState(
    companySlug,
    vehicle.id,
    SITE_CHANNEL,
  );
  const bookHref = publicSiteHref(
    siteBookHref({
      slug: site.slug,
      carId: vehicle.id,
      from,
      to,
      branch,
      preview,
    }),
    site.slug,
    onTenantHost,
  );

  return (
    <>
      <SiteHeader
        companyName={site.company.name}
        logoUrl={site.company.branding.logoUrl}
        homeHref={homeHref}
        fleetHref={`${homeHref}#fleet`}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6 lg:px-8">
        {isSitePaused(site) ? (
          <div className="mb-6">
            <SitePausedNotice compact />
          </div>
        ) : null}
        <HydrationBoundary state={dehydratedState}>
          <CarDetailView
            vehicle={vehicle}
            companySlug={companySlug}
            companyName={site.company.name}
            isTenant
            initialFrom={from}
            initialTo={to}
            backHref={homeHref}
            backLabel={t("backToFleet")}
            bookingsEnabled={canAcceptBookings(site)}
            bookHrefOverride={bookHref}
            requestMode={isRequestBooking(site)}
            channel={SITE_CHANNEL}
          />
        </HydrationBoundary>
        <JsonLd
          data={carProductJsonLd({
            vehicle,
            companyName: site.company.name,
            description: vehicle.description ?? "",
            url: siteCanonicalPageUrl(
              site.canonicalUrl,
              siteCarPath(site.slug, vehicle.id),
              site.slug,
            ),
          })}
        />
      </main>
      <SiteFooter companyName={site.company.name} homeHref={homeHref} />
    </>
  );
}

export default CompanySiteCarPage;
