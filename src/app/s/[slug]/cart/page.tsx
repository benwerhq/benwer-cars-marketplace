import type { Metadata } from "next";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CartView } from "@/components/features/CartView";
import { SitePausedNotice } from "@/components/features/SitePausedNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { loadPublicSite, previewFromQuery } from "@/lib/loadPublicSite";
import {
  canAcceptBookings,
  companySlugFromSite,
  guestLinksFromHomeHref,
  isTenantHostRequest,
  publicSiteHref,
  publicSiteHomeHref,
  SITE_CHANNEL,
  siteBookHref,
  siteCarPath,
  publicSitePath,
  siteBookingBasePath,
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
  const t = await getTranslations("cart");
  const tBrand = await getTranslations("brand");

  return buildPageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: `/s/${slug}/cart`,
    siteName: tBrand("name"),
    locale,
    noIndex: true,
  });
}

async function CompanySiteCartPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const preview = previewFromQuery(query);
  const t = await getTranslations("booking");

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
        <EmptyState title={t("missingTitle")} description={t("missingDescription")} />
      </main>
    );
  }

  // Server-built link templates; CartView fills in each car and its dates.
  const carHrefTemplate = publicSiteHref(siteCarPath(site.slug, "__car__"), site.slug, onTenantHost);
  const bookHrefTemplate = publicSiteHref(
    siteBookHref({ slug: site.slug, carId: "__car__", preview }),
    site.slug,
    onTenantHost,
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
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-6 lg:px-8 lg:pb-16">
        {canAcceptBookings(site) ? (
          <CartView
            cartSlug={slug}
            companySlug={companySlugFromSite(site)}
            branches={site.branches}
            allowDifferentReturn={site.allowDifferentReturn}
            channel={SITE_CHANNEL}
            fleetHref={`${homeHref}#fleet`}
            carHrefTemplate={carHrefTemplate}
            bookHrefTemplate={bookHrefTemplate}
            guestSignInHref={guestLinksFromHomeHref(homeHref).signIn}
            confirmationBaseUrl={publicSitePath(
            siteBookingBasePath(site.slug),
            site.slug,
            onTenantHost,
          )}
          />
        ) : (
          <SitePausedNotice />
        )}
      </main>
      <SiteFooter companyName={site.company.name} homeHref={homeHref} />
    </>
  );
}

export default CompanySiteCartPage;
