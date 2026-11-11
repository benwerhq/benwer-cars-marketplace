import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { HydrationBoundary } from "@tanstack/react-query";
import { TenantHeader } from "@/components/layout/TenantHeader";
import { Footer } from "@/components/layout/Footer";
import { CarDetailView } from "@/components/features/CarDetailView";
import { JsonLd } from "@/components/seo/JsonLd";
import { vehiclesApi, companiesApi } from "@/services/api";
import { NavRoutes } from "@/enums";
import { appendSearchParams } from "@/lib/marketplaceSearch";
import { prefetchAvailabilityState } from "@/lib/prefetchAvailability";
import { absoluteUrl, buildPageMetadata, carProductJsonLd } from "@/lib/seo";
import { vehicleImageUrls } from "@/lib/vehicleImage";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ id }, headersList] = await Promise.all([params, headers()]);
  const slug = headersList.get("x-company-slug") ?? "";
  const locale = await getLocale();
  const t = await getTranslations("carDetail");
  const tMeta = await getTranslations("seo");
  const tBrand = await getTranslations("brand");
  const tCars = await getTranslations("cars");
  const path = `/cars/${id}`;

  try {
    const vehicle = await vehiclesApi.getById(slug, id);
    const transmission = tCars(`transmission.${vehicle.transmission}`);
    const description =
      vehicle.description ??
      tMeta("carDescriptionSpecs", {
        brand: vehicle.brand,
        model: vehicle.model,
        seats: vehicle.seats,
        transmission,
      });

    return buildPageMetadata({
      title: tMeta("carTitleTenant", {
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
      }),
      description,
      path,
      siteName: tBrand("name"),
      locale,
      images: vehicleImageUrls(vehicle),
    });
  } catch {
    return buildPageMetadata({
      title: t("metaTitle"),
      description: tCars("title"),
      path,
      siteName: tBrand("name"),
      locale,
    });
  }
}

async function TenantCarDetailPage({ params, searchParams }: Props) {
  const [{ id }, query, headersList] = await Promise.all([
    params,
    searchParams,
    headers(),
  ]);
  const companySlug = headersList.get("x-company-slug");
  const t = await getTranslations("carDetail");

  if (!companySlug) notFound();

  let vehicle;
  try {
    vehicle = await vehiclesApi.getById(companySlug, id);
  } catch {
    notFound();
  }

  let company = null;
  try {
    company = await companiesApi.getBySlug(companySlug);
  } catch {
    /* fallback gracefully */
  }

  const dehydratedState = await prefetchAvailabilityState(companySlug, id);
  const tMeta = await getTranslations("seo");
  const tCars = await getTranslations("cars");
  const transmission = tCars(`transmission.${vehicle.transmission}`);
  const productDescription =
    vehicle.description ??
    tMeta("carDescriptionSpecs", {
      brand: vehicle.brand,
      model: vehicle.model,
      seats: vehicle.seats,
      transmission,
    });

  return (
    <>
      <JsonLd
        data={carProductJsonLd({
          vehicle,
          companyName: company?.name ?? companySlug,
          description: productDescription,
          url: absoluteUrl(`/cars/${id}`),
        })}
      />
      <TenantHeader
        companyName={company?.name ?? companySlug}
        logoUrl={company?.branding.logoUrl}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-28 md:px-6 lg:px-8 lg:pb-16">
        <HydrationBoundary state={dehydratedState}>
          <CarDetailView
            vehicle={vehicle}
            companySlug={companySlug}
            companyName={company?.name}
            companyWebsiteUrl={company?.websiteUrl}
            isTenant
            initialFrom={query.from}
            initialTo={query.to}
            backHref={appendSearchParams(NavRoutes.HOME, {
              from: query.from,
              to: query.to,
            })}
            backLabel={t("backToFleet")}
          />
        </HydrationBoundary>
      </main>
      <Footer />
    </>
  );
}

export default TenantCarDetailPage;
