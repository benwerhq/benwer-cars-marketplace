import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Car } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import { MarketplaceHeader } from "@/components/layout/MarketplaceHeader";
import { TenantHeader } from "@/components/layout/TenantHeader";
import { Footer } from "@/components/layout/Footer";
import { BookingView } from "@/components/features/BookingView";
import { EmptyState } from "@/components/ui/EmptyState";
import { companiesApi, vehiclesApi } from "@/services/api";
import { NavRoutes, SearchParams } from "@/enums";
import { buildCarDetailHref, buildFleetHref } from "@/lib/booking";
import { buildCompanySiteHref } from "@/lib/companySite";
import { parseDriverAge, siteBookHref, siteHomePath } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("booking");
  const tBrand = await getTranslations("brand");

  return buildPageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: "/book",
    siteName: tBrand("name"),
    locale,
    noIndex: true,
  });
}

interface Props {
  searchParams: Promise<{
    carId?: string;
    companySlug?: string;
    from?: string;
    to?: string;
    age?: string;
  }>;
}

async function BookPage({ searchParams }: Props) {
  const { carId, companySlug: querySlug, from, to, age } = await searchParams;
  const driverAge = parseDriverAge(age);
  const ageParam = age ? driverAge : undefined;
  const t = await getTranslations("booking");
  const headersList = await headers();
  const tenantSlug = headersList.get("x-company-slug");
  const isTenant = Boolean(tenantSlug);
  const companySlug = tenantSlug ?? querySlug ?? "";

  if (!isTenant) {
    let websiteUrl: string | null = null;
    if (companySlug) {
      try {
        const listed = await companiesApi.getBySlug(companySlug);
        websiteUrl = listed.websiteUrl;
      } catch {
        websiteUrl = null;
      }
    }

    if (companySlug && websiteUrl) {
      redirect(
        buildCompanySiteHref({
          slug: companySlug,
          websiteUrl,
          path: carId ? "/book" : undefined,
          from,
          to,
          params: {
            [SearchParams.CAR_ID]: carId || undefined,
            [SearchParams.DRIVER_AGE]: ageParam,
          },
        }),
      );
    }

    if (companySlug && carId) {
      redirect(
        siteBookHref({
          slug: companySlug,
          carId,
          from,
          to,
          driverAge: ageParam,
        }),
      );
    }

    if (companySlug) {
      redirect(siteHomePath(companySlug));
    }
  }

  if (!carId || !companySlug) {
    return (
      <BookingChrome isTenant={isTenant} companyName={companySlug}>
        <EmptyState
          icon={<Car size={40} />}
          title={t("missingTitle")}
          description={t("missingDescription")}
          actionLabel={t("browseCars")}
          actionHref={isTenant ? NavRoutes.HOME : NavRoutes.CARS}
        />
      </BookingChrome>
    );
  }

  let vehicle;
  try {
    vehicle = await vehiclesApi.getById(companySlug, carId);
  } catch {
    return (
      <BookingChrome isTenant={isTenant} companyName={companySlug}>
        <EmptyState
          icon={<Car size={40} />}
          title={t("vehicleMissingTitle")}
          description={t("vehicleMissingDescription")}
          actionLabel={t("viewFleet")}
          actionHref={buildFleetHref({ companySlug, from, to, isTenant })}
        />
      </BookingChrome>
    );
  }

  let company = null;
  try {
    company = await companiesApi.getBySlug(companySlug);
  } catch {
    company = null;
  }

  const carHref = buildCarDetailHref({
    companySlug,
    carId,
    from,
    to,
    isTenant,
  });

  return (
    <BookingChrome
      isTenant={isTenant}
      companyName={company?.name ?? companySlug}
      logoUrl={company?.branding.logoUrl}
      logoDarkUrl={company?.branding.logoDarkUrl}
    >
      <BookingView
        vehicle={vehicle}
        company={company}
        companySlug={companySlug}
        defaultFrom={from}
        defaultTo={to}
        carHref={carHref}
        showInsurance
      />
    </BookingChrome>
  );
}

function BookingChrome({
  children,
  isTenant,
  companyName,
  logoUrl,
  logoDarkUrl,
}: {
  children: ReactNode;
  isTenant: boolean;
  companyName?: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
}) {
  return (
    <>
      {isTenant ? (
        <TenantHeader
          companyName={companyName ?? ""}
          logoUrl={logoUrl}
          logoDarkUrl={logoDarkUrl}
        />
      ) : (
        <MarketplaceHeader />
      )}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-28 md:px-6 lg:px-8 lg:pb-16">
        {children}
      </main>
      <Footer />
    </>
  );
}

export default BookPage;
