"use client";

import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";
import { Mail, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { CompanyMark, hasCompanyLogo } from "@/components/features/CompanyMark";
import { SitePausedNotice } from "@/components/features/SitePausedNotice";
import { SiteSearchForm } from "@/components/features/SiteSearchForm";
import { CarListView } from "@/components/features/CarListView";
import { SiteSectionId } from "@/enums";
import {
  SITE_CHANNEL,
  canAcceptBookings,
  isSitePaused,
  sitePathFromHome,
} from "@/lib/site";
import { visibleSections, whatsappHref } from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import type { PublicSite } from "@/types/site";
import { SiteAppSection } from "./SiteAppSection";
import { SiteBannerCarousel } from "./SiteBannerCarousel";
import { SiteContactSection } from "./SiteContactSection";
import { SiteFaqSection } from "./SiteFaqSection";
import { SiteIncludedSection } from "./SiteIncludedSection";
import { SiteLocationsSection } from "./SiteLocationsSection";
import { SiteReviewsSection } from "./SiteReviewsSection";

export interface SiteHomeCopy {
  headline: string;
  intro: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  whatsapp?: string | null;
  rating?: { score: number; count: number } | null;
}

interface SiteHomeLayoutsProps {
  site: PublicSite;
  copy: SiteHomeCopy;
  companySlug: string;
  homeHref: string;
  preview?: string;
  from: string;
  to: string;
  branch: string;
  returnBranch?: string;
  dehydratedState: DehydratedState;
}

export function SiteHomeLayouts({
  site,
  copy,
  companySlug,
  homeHref,
  preview,
  from,
  to,
  branch,
  returnBranch = "",
  dehydratedState,
}: SiteHomeLayoutsProps) {
  const searchProps = {
    homeHref,
    branches: site.branches,
    defaultFrom: from,
    defaultTo: to,
    defaultBranch: branch,
    defaultReturnBranch: returnBranch,
    allowDifferentReturn: site.allowDifferentReturn,
    preview,
    disabled: !canAcceptBookings(site),
  };
  const paused = isSitePaused(site) ? <SitePausedNotice /> : null;
  const visible = visibleSections(site.content, {
    branchCount: site.branches.length,
    hasPhone: Boolean(copy.phone),
    hasEmail: Boolean(copy.email),
  });
  const showHero = visible.includes(SiteSectionId.HERO);
  const showSearch = visible.includes(SiteSectionId.SEARCH);

  const blocks = visible.map((id) => {
    switch (id) {
      case SiteSectionId.HERO:
        return (
          <div key={id} className="mx-auto w-full max-w-7xl px-4 pt-6 md:px-6 lg:px-8">
            <SiteBannerCarousel
              banners={site.content.banners}
              theme={site.content.bannerTheme}
              companyName={site.company.name}
              homeHref={homeHref}
            />
            {showSearch ? (
              <div className="relative z-10 mt-4 md:px-10">
                <SiteSearchForm {...searchProps} variant="hero" />
              </div>
            ) : null}
          </div>
        );
      case SiteSectionId.SEARCH:
        return showHero ? null : (
          <div key={id} className="mx-auto w-full max-w-7xl px-4 pt-6 md:px-6 lg:px-8">
            <SiteSearchForm {...searchProps} variant="hero" />
          </div>
        );
      case SiteSectionId.COMPANY:
        return (
          <div key={id} className={cn(showHero && "mt-10")}>
            <CompanyHeader site={site} copy={copy} />
          </div>
        );
      case SiteSectionId.FLEET:
        return (
          <main
            key={id}
            id="fleet"
            className="mx-auto flex w-full max-w-7xl scroll-mt-20 flex-col gap-8 px-4 py-10 md:px-6 lg:px-8"
          >
            {paused}
            <HydrationBoundary state={dehydratedState}>
              <CarListView
                layout="rows"
                companySlug={companySlug}
                hrefBase={sitePathFromHome(homeHref, "/cars")}
                showDateSearch={false}
                filterByAvailability
                showDirectoryEmptyAction={false}
                channel={SITE_CHANNEL}
              />
            </HydrationBoundary>
          </main>
        );
      default:
        return null;
    }
  });

  const lower = visible.filter((id) => LOWER_SECTIONS.includes(id));

  return (
    <>
      {blocks}
      {lower.length > 0 ? (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 pt-8 pb-20 md:px-6 lg:px-8">
          {lower.map((id) => (
            <LowerSection key={id} id={id} site={site} copy={copy} />
          ))}
        </div>
      ) : null}
    </>
  );
}

const LOWER_SECTIONS: SiteSectionId[] = [
  SiteSectionId.INCLUDED,
  SiteSectionId.REVIEWS,
  SiteSectionId.APP,
  SiteSectionId.BRANCHES,
  SiteSectionId.FAQ,
  SiteSectionId.CONTACT,
];

function LowerSection({
  id,
  site,
  copy,
}: {
  id: SiteSectionId;
  site: PublicSite;
  copy: SiteHomeCopy;
}) {
  switch (id) {
    case SiteSectionId.INCLUDED:
      return <SiteIncludedSection items={site.content.included} />;
    case SiteSectionId.REVIEWS:
      return <SiteReviewsSection reviews={site.content.reviews} />;
    case SiteSectionId.APP:
      return <SiteAppSection app={site.content.app} />;
    case SiteSectionId.BRANCHES:
      return (
        <SiteLocationsSection
          branches={site.branches}
          companyName={site.company.name}
          phone={copy.phone}
        />
      );
    case SiteSectionId.FAQ:
      return <SiteFaqSection items={site.content.faq} />;
    case SiteSectionId.CONTACT:
      return (
        <SiteContactSection
          contact={site.content.contact}
          companyName={site.company.name}
          phone={copy.phone}
          email={copy.email}
        />
      );
    default:
      return null;
  }
}

function CompanyHeader({ site, copy }: { site: PublicSite; copy: SiteHomeCopy }) {
  const withLogo = hasCompanyLogo(site.company);

  return (
    <section className="relative w-full overflow-hidden border-y border-border bg-gradient-to-br from-primary/10 via-background to-accent-soft">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-10 md:px-6 md:py-12 lg:px-8">
        <div className={cn("flex gap-4", withLogo ? "flex-col" : "items-start")}>
          <CompanyMark
            company={site.company}
            size="lg"
            className={withLogo ? "h-12" : "h-16 w-16 rounded-2xl"}
          />
          <div className="min-w-0">
            {withLogo ? null : (
              <p className="text-sm font-medium text-primary">{site.company.name}</p>
            )}
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              {copy.headline}
            </h1>
            {copy.intro ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {copy.intro}
              </p>
            ) : null}
          </div>
        </div>
        <ContactRow copy={copy} />
      </div>
    </section>
  );
}

function ContactRow({ copy }: { copy: SiteHomeCopy }) {
  const t = useTranslations("siteSections");
  const whatsapp = copy.whatsapp ? whatsappHref(copy.whatsapp) : null;
  if (!copy.phone && !copy.email && !copy.address && !whatsapp && !copy.rating) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-2 text-sm text-foreground sm:flex-row sm:flex-wrap sm:gap-6">
      {copy.phone ? (
        <li className="inline-flex items-center gap-2">
          <Phone size={16} className="text-primary" aria-hidden />
          <a href={`tel:${copy.phone}`} className="hover:text-primary">
            {copy.phone}
          </a>
        </li>
      ) : null}
      {copy.email ? (
        <li className="inline-flex items-center gap-2">
          <Mail size={16} className="text-primary" aria-hidden />
          <a href={`mailto:${copy.email}`} className="hover:text-primary">
            {copy.email}
          </a>
        </li>
      ) : null}
      {whatsapp ? (
        <li className="inline-flex items-center gap-2">
          <MessageCircle size={16} className="text-primary" aria-hidden />
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            {t("footer.whatsapp")}
          </a>
        </li>
      ) : null}
      {copy.address ? (
        <li className="inline-flex items-center gap-2">
          <MapPin size={16} className="text-primary" aria-hidden />
          <span>{copy.address}</span>
        </li>
      ) : null}
      {copy.rating ? (
        <li className="inline-flex items-center gap-2">
          <Star size={16} className="fill-warning text-warning" aria-hidden />
          <a href={`#reviews`} className="hover:text-primary">
            {t("footer.rating", {
              score: copy.rating.score.toFixed(1),
              count: copy.rating.count,
            })}
          </a>
        </li>
      ) : null}
    </ul>
  );
}
