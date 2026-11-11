import type { Metadata } from "next";
import Link from "next/link";
import { HydrationBoundary } from "@tanstack/react-query";
import { getLocale, getTranslations } from "next-intl/server";
import { MarketplaceHeader } from "@/components/layout/MarketplaceHeader";
import { Footer } from "@/components/layout/Footer";
import { CompanyListView } from "@/components/features/CompanyListView";
import { FeaturedCars } from "@/components/features/FeaturedCars";
import { HowItWorks } from "@/components/features/HowItWorks";
import { AppDownloadBanner } from "@/components/features/AppDownloadBanner";
import { MarketplaceFaq } from "@/components/features/MarketplaceFaq";
import { MarketplaceSearchHeader } from "@/components/features/MarketplaceSearchHeader";
import { MarketplaceBannerCarousel } from "@/components/features/MarketplaceBannerCarousel";
import { PartnersInvite } from "@/components/features/PartnersInvite";
import { WhatYouGet } from "@/components/features/WhatYouGet";
import { NavRoutes } from "@/enums";
import { prefetchMarketplaceHomeState } from "@/lib/prefetchMarketplaceHome";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMarketplaceHomeMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("home");
  const tBrand = await getTranslations("brand");

  return buildPageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: "/",
    siteName: tBrand("name"),
    locale,
  });
}

export async function MarketplaceHome() {
  const t = await getTranslations("home");
  const { dehydratedState, companies } = await prefetchMarketplaceHomeState();

  return (
    <>
      <MarketplaceHeader />
      <MarketplaceBannerCarousel />
      <MarketplaceSearchHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 md:gap-10 md:px-6 md:py-10 lg:px-8">
        <HydrationBoundary state={dehydratedState}>
          <div className="flex flex-col gap-8 md:gap-10">
            <HowItWorks />
            <FeaturedCars />
            <section className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h2 className="min-w-0 text-xl font-semibold text-foreground">
                    {t("companiesHeading")}
                  </h2>
                  <Link
                    href={NavRoutes.COMPANIES}
                    className="shrink-0 cursor-pointer text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {t("viewAllCompanies")}
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("companiesSubtitle")}
                </p>
              </div>
              <CompanyListView
                showSearchBar={false}
                limit={6}
                initialCompanies={companies}
              />
            </section>
          </div>
        </HydrationBoundary>
        <WhatYouGet />
        <PartnersInvite />
        <AppDownloadBanner />
        <MarketplaceFaq />
      </main>
      <Footer />
    </>
  );
}
