import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { MarketplaceHeader } from "@/components/layout/MarketplaceHeader";
import { Footer } from "@/components/layout/Footer";
import { CarDetailView } from "@/components/features/CarDetailView";
import { JsonLd } from "@/components/seo/JsonLd";
import { vehiclesApi, companiesApi } from "@/services/api";
import { NavRoutes } from "@/enums";
import { appendSearchParams, buildCompanyHref } from "@/lib/marketplaceSearch";
import { absoluteUrl, buildPageMetadata, carProductJsonLd } from "@/lib/seo";
import { vehicleImageUrls } from "@/lib/vehicleImage";

interface Props {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{
    location?: string;
    from?: string;
    to?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("carDetail");
  const tMeta = await getTranslations("seo");
  const tBrand = await getTranslations("brand");
  const tCars = await getTranslations("cars");
  const path = `/companies/${slug}/cars/${id}`;

  try {
    const [vehicle, company] = await Promise.all([
      vehiclesApi.getById(slug, id),
      companiesApi.getBySlug(slug),
    ]);
    const description =
      vehicle.description ??
      tMeta("carDescription", {
        brand: vehicle.brand,
        model: vehicle.model,
        company: company.name,
      });

    return buildPageMetadata({
      title: tMeta("carTitle", {
        brand: vehicle.brand,
        model: vehicle.model,
        company: company.name,
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

async function CompanyCarDetailPage({ params, searchParams }: Props) {
  const [{ slug, id }, query] = await Promise.all([params, searchParams]);
  const t = await getTranslations("carDetail");
  const tNav = await getTranslations("nav");

  let vehicle;
  try {
    vehicle = await vehiclesApi.getById(slug, id);
  } catch {
    notFound();
  }

  let company = null;
  try {
    company = await companiesApi.getBySlug(slug);
  } catch {
    /* fallback gracefully */
  }

  const browse = {
    location: query.location,
    from: query.from,
    to: query.to,
  };
  const companyHref = buildCompanyHref(slug, browse);
  const tMeta = await getTranslations("seo");
  const productDescription =
    vehicle.description ??
    tMeta("carDescription", {
      brand: vehicle.brand,
      model: vehicle.model,
      company: company?.name ?? slug,
    });

  return (
    <>
      <JsonLd
        data={carProductJsonLd({
          vehicle,
          companyName: company?.name ?? slug,
          description: productDescription,
          url: absoluteUrl(`/companies/${slug}/cars/${id}`),
        })}
      />
      <MarketplaceHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-28 md:px-6 lg:px-8 lg:pb-16">
        <nav
          aria-label={t("breadcrumbAria")}
          className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link
            href={appendSearchParams(NavRoutes.CARS, browse)}
            className="cursor-pointer transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {tNav("cars")}
          </Link>
          {company ? (
            <>
              <span aria-hidden>/</span>
              <Link
                href={companyHref}
                className="cursor-pointer transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {company.name}
              </Link>
            </>
          ) : null}
          <span aria-hidden>/</span>
          <span className="text-foreground">
            {vehicle.brand} {vehicle.model}
          </span>
        </nav>
        <CarDetailView
          vehicle={vehicle}
          companySlug={slug}
          companyName={company?.name}
          companyWebsiteUrl={company?.websiteUrl}
          initialFrom={query.from}
          initialTo={query.to}
          backHref={companyHref}
          backLabel={t("backToFleet")}
        />
      </main>
      <Footer />
    </>
  );
}

export default CompanyCarDetailPage;
