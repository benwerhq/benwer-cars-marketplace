import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import { MarketplaceHeader } from "@/components/layout/MarketplaceHeader";
import { TenantHeader } from "@/components/layout/TenantHeader";
import { Footer } from "@/components/layout/Footer";
import { GuestAppBadges } from "@/components/features/GuestAppBadges";
import { ReservationStatus } from "@/components/features/ReservationStatus";
import { companiesApi, reservationsApi } from "@/services/api";
import { buildCompanySiteHref } from "@/lib/companySite";
import { logError } from "@/lib/logger";
import { NavRoutes } from "@/enums";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("reservationStatus");
  const tBrand = await getTranslations("brand");

  return buildPageMetadata({
    title: t("title"),
    description: t("successTitle"),
    path: "/booking",
    siteName: tBrand("name"),
    locale,
    noIndex: true,
  });
}

interface Props {
  params: Promise<{ token: string }>;
}

async function BookingStatusPage({ params }: Props) {
  const { token } = await params;
  const tApp = await getTranslations("guestApp");
  const headersList = await headers();
  const tenantSlug = headersList.get("x-company-slug");
  const isTenant = Boolean(tenantSlug);

  if (!isTenant) {
    const companySiteHref = await companySiteBookingHref(token);
    if (companySiteHref) {
      redirect(companySiteHref);
    }
  }

  let companyName = tenantSlug ?? "";
  let logoUrl: string | null = null;
  let logoDarkUrl: string | null = null;
  if (tenantSlug) {
    try {
      const company = await companiesApi.getBySlug(tenantSlug);
      companyName = company.name;
      logoUrl = company.branding.logoUrl;
      logoDarkUrl = company.branding.logoDarkUrl ?? null;
    } catch {
      companyName = tenantSlug;
    }
  }

  return (
    <>
      {isTenant ? (
        <TenantHeader
          companyName={companyName}
          logoUrl={logoUrl}
          logoDarkUrl={logoDarkUrl}
        />
      ) : (
        <MarketplaceHeader />
      )}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 md:px-6 md:py-12">
        <ReservationStatus
          token={token}
          companySlug={tenantSlug ?? undefined}
          browseHref={isTenant ? NavRoutes.HOME : NavRoutes.CARS}
        />
        <GuestAppBadges className="mt-10" text={tApp("bookingText")} />
      </main>
      <Footer />
    </>
  );
}

async function companySiteBookingHref(token: string): Promise<string | null> {
  try {
    const reservation = await reservationsApi.getByToken(token);
    if (!reservation.companySlug) {
      return null;
    }
    const company = await companiesApi.getBySlug(reservation.companySlug);
    return buildCompanySiteHref({
      slug: reservation.companySlug,
      websiteUrl: company.websiteUrl,
      path: `/booking/${encodeURIComponent(token)}`,
    });
  } catch (error) {
    logError(error, { context: "booking_site_redirect" });
    return null;
  }
}

export default BookingStatusPage;
