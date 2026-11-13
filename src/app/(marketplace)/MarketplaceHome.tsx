import type { Metadata } from "next";
import Link from "next/link";
import { HydrationBoundary } from "@tanstack/react-query";
import { BadgeCheck, MapPin, UserRound } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { MarketplaceHeader } from "@/components/layout/MarketplaceHeader";
import { Footer } from "@/components/layout/Footer";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CompanyListView } from "@/components/features/CompanyListView";
import { FeaturedCars } from "@/components/features/FeaturedCars";
import { MarketplaceBannerCarousel } from "@/components/features/MarketplaceBannerCarousel";
import { MarketplaceHeroSearch } from "@/components/features/MarketplaceHeroSearch";
import { PartnersInvite } from "@/components/features/PartnersInvite";
import { SiteAppSection } from "@/components/features/SiteAppSection";
import { SiteFaqSection } from "@/components/features/SiteFaqSection";
import { SiteIncludedSection } from "@/components/features/SiteIncludedSection";
import {
  SiteIntroBand,
  SiteIntroFacts,
} from "@/components/features/SiteIntroBand";
import { SiteSectionHeading } from "@/components/features/SiteSectionHeading";
import { AppStoreLinks, NavRoutes, SiteIncludedIcon } from "@/enums";
import { prefetchMarketplaceHomeState } from "@/lib/prefetchMarketplaceHome";
import { buildPageMetadata } from "@/lib/seo";
import type {
  LocalizedCopy,
  SiteAppContent,
  SiteFaqItem,
  SiteIncludedItem,
} from "@/types/siteContent";

const STEPS = [
  { key: "search", icon: SiteIncludedIcon.CALENDAR_CHECK },
  { key: "compare", icon: SiteIncludedIcon.CAR },
  { key: "continue", icon: SiteIncludedIcon.KEY },
] as const;

const FAQ_KEYS = [
  "partners",
  "booking",
  "photos",
  "account",
  "safety",
] as const;

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
  const locale = await getLocale();
  const t = await getTranslations("home");
  const tBrand = await getTranslations("brand");
  const tSteps = await getTranslations("howItWorks");
  const tFaq = await getTranslations("faq");
  const tApp = await getTranslations("appBanner");
  const { dehydratedState, companies } = await prefetchMarketplaceHomeState();
  const copy = (text: string): LocalizedCopy => ({ [locale]: text });

  const steps: SiteIncludedItem[] = STEPS.map(({ key, icon }) => ({
    id: key,
    preset: null,
    icon,
    title: copy(tSteps(`${key}Title`)),
    text: copy(tSteps(`${key}Body`)),
    tag: {},
  }));

  const faq: SiteFaqItem[] = FAQ_KEYS.map((key) => ({
    id: key,
    question: copy(tFaq(`items.${key}.question`)),
    answer: copy(tFaq(`items.${key}.answer`)),
  }));

  const app: SiteAppContent = {
    iosUrl: "",
    androidUrl: AppStoreLinks.ANDROID_TESTING,
    title: copy(tApp("title")),
    text: copy(tApp("description")),
  };

  const facts = [
    { icon: MapPin, label: t("eyebrow") },
    { icon: BadgeCheck, label: t("trustLocal") },
    { icon: UserRound, label: t("trustGuest") },
  ];

  return (
    <>
      <MarketplaceHeader />
      <MarketplaceBannerCarousel>
        <MarketplaceHeroSearch />
      </MarketplaceBannerCarousel>
      <HydrationBoundary state={dehydratedState}>
        <div className="mt-10">
          <SiteIntroBand
            mark={
              <BrandLogo
                alt={tBrand("logoAlt")}
                variant="full"
                className="h-16 w-32"
              />
            }
            title={t("title")}
            intro={t("subtitle")}
          >
            <SiteIntroFacts>
              {facts.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon size={16} className="text-primary" aria-hidden />
                  {label}
                </li>
              ))}
            </SiteIntroFacts>
          </SiteIntroBand>
        </div>
        <main
          id="fleet"
          className="mx-auto flex w-full max-w-7xl scroll-mt-20 flex-col gap-8 px-4 py-10 md:px-6 lg:px-8"
        >
          <FeaturedCars initialCompanies={companies} />
        </main>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 pt-8 pb-20 md:px-6 lg:px-8">
          <SiteIncludedSection
            items={steps}
            heading={{
              eyebrow: tSteps("eyebrow"),
              title: tSteps("title"),
              description: tSteps("subtitle"),
            }}
          />
          <section
            aria-labelledby="companies-heading"
            className="flex flex-col gap-8"
          >
            <SiteSectionHeading
              id="companies-heading"
              eyebrow={t("companiesEyebrow")}
              title={t("companiesHeading")}
              description={t("companiesSubtitle")}
              action={
                <Link
                  href={NavRoutes.COMPANIES}
                  className="cursor-pointer text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {t("viewAllCompanies")}
                </Link>
              }
            />
            <CompanyListView
              showSearchBar={false}
              limit={6}
              initialCompanies={companies}
            />
          </section>
          <PartnersInvite />
          <SiteAppSection app={app} />
          <SiteFaqSection
            items={faq}
            heading={{
              eyebrow: tFaq("eyebrow"),
              title: tFaq("title"),
              description: tFaq("subtitle"),
            }}
          />
        </div>
      </HydrationBoundary>
      <Footer />
    </>
  );
}
