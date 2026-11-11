"use client";

import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";
import { Mail, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { CompanyMark } from "@/components/features/CompanyMark";
import { SitePausedNotice } from "@/components/features/SitePausedNotice";
import { SiteSearchForm } from "@/components/features/SiteSearchForm";
import { CarListView } from "@/components/features/CarListView";
import { SiteLayout, SiteSectionId } from "@/enums";
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
  dehydratedState,
}: Omit<SiteHomeLayoutsProps, "fleet">) {
  const search = (
    <SiteSearchForm
      homeHref={homeHref}
      branches={site.branches}
      defaultFrom={from}
      defaultTo={to}
      defaultBranch={branch}
      preview={preview}
      disabled={!canAcceptBookings(site)}
    />
  );
  const fleet = (
    <HydrationBoundary state={dehydratedState}>
      <CarListView
        layout={site.layout === SiteLayout.CLASSIC ? "rows" : "rail"}
        companySlug={companySlug}
        hrefBase={sitePathFromHome(homeHref, "/cars")}
        showDateSearch={false}
        filterByAvailability
        showDirectoryEmptyAction={false}
        channel={SITE_CHANNEL}
      />
    </HydrationBoundary>
  );
  const paused = isSitePaused(site) ? <SitePausedNotice /> : null;
  const layout = site.layout;
  const visible = visibleSections(site.content, {
    branchCount: site.branches.length,
    hasPhone: Boolean(copy.phone),
    hasEmail: Boolean(copy.email),
  });
  const lower = <SiteLowerSections site={site} copy={copy} visible={visible} />;

  if (layout === SiteLayout.MODERN_HERO) {
    return (
      <div className="flex flex-col">
        <HeroBanner site={site} copy={copy} variant="full" />
        <div className="-mt-10 px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-surface p-4 shadow-lg">
            {search}
          </div>
        </div>
        <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 md:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)] md:px-6 lg:px-8">
          <div id="fleet">{paused}{fleet}</div>
          <ContactAside copy={copy} />
        </main>
        {lower}
      </div>
    );
  }

  if (layout === SiteLayout.MINIMAL_LIST) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
        <HeroBanner site={site} copy={copy} variant="minimal" />
        {search}
        {paused}
        <div id="fleet" className="border-t border-border pt-6">
          {fleet}
        </div>
        {lower}
      </div>
    );
  }

  if (layout === SiteLayout.GRID_GALLERY) {
    return (
      <div className="flex flex-col gap-0">
        <div className="border-b border-border bg-foreground px-4 py-8 text-background md:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <HeroBanner site={site} copy={copy} variant="inverse" />
            <div className="w-full max-w-md rounded-xl bg-background p-3 text-foreground">
              {search}
            </div>
          </div>
        </div>
        <main id="fleet" className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
          {paused}
          {fleet}
        </main>
        {lower}
      </div>
    );
  }

  if (layout === SiteLayout.BOLD_LANDING) {
    return (
      <div className="flex flex-col">
        <section className="bg-primary px-4 py-16 text-primary-foreground md:px-6 md:py-24 lg:px-8">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <CompanyMark company={site.company} size="lg" className="h-20 w-20 rounded-3xl" />
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              {copy.headline}
            </h1>
            {copy.intro ? (
              <p className="max-w-2xl text-base text-primary-foreground/80">
                {copy.intro}
              </p>
            ) : null}
            <div className="w-full max-w-xl rounded-2xl bg-background p-4 text-foreground">
              {search}
            </div>
          </div>
        </section>
        <main id="fleet" className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 lg:px-8">
          {paused}
          {fleet}
        </main>
        {lower}
      </div>
    );
  }

  const showBanners = visible.includes(SiteSectionId.BANNERS);
  const blocks = visible.map((id) => {
    switch (id) {
      case SiteSectionId.BANNERS:
        return (
          <div key={id} className="mx-auto w-full max-w-7xl px-4 pt-6 md:px-6 lg:px-8">
            <SiteBannerCarousel
              banners={site.content.banners}
              companyName={site.company.name}
            />
            <div className="relative z-10 -mt-12 px-0 md:-mt-20 md:px-10">
              <SiteSearchForm
                homeHref={homeHref}
                branches={site.branches}
                defaultFrom={from}
                defaultTo={to}
                defaultBranch={branch}
                preview={preview}
                disabled={!canAcceptBookings(site)}
                variant="hero"
              />
            </div>
          </div>
        );
      case SiteSectionId.COMPANY:
        return (
          <div key={id} className={cn(showBanners && "mt-10")}>
            <HeroBanner site={site} copy={copy} variant="classic" />
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
            {showBanners ? null : search}
            {fleet}
          </main>
        );
      default:
        return null;
    }
  });

  return (
    <>
      {blocks}
      {lower}
    </>
  );
}

const LOWER_SECTIONS: SiteSectionId[] = [
  SiteSectionId.INCLUDED,
  SiteSectionId.REVIEWS,
  SiteSectionId.APP,
  SiteSectionId.LOCATIONS,
  SiteSectionId.FAQ,
  SiteSectionId.CONTACT,
];

function SiteLowerSections({
  site,
  copy,
  visible,
}: {
  site: PublicSite;
  copy: SiteHomeCopy;
  visible: SiteSectionId[];
}) {
  const sections = visible.filter((id) => LOWER_SECTIONS.includes(id));
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 pt-8 pb-20 md:px-6 lg:px-8">
      {sections.map((id) => {
        switch (id) {
          case SiteSectionId.INCLUDED:
            return <SiteIncludedSection key={id} items={site.content.included} />;
          case SiteSectionId.REVIEWS:
            return <SiteReviewsSection key={id} reviews={site.content.reviews} />;
          case SiteSectionId.APP:
            return <SiteAppSection key={id} app={site.content.app} />;
          case SiteSectionId.LOCATIONS:
            return (
              <SiteLocationsSection
                key={id}
                branches={site.branches}
                companyName={site.company.name}
                phone={copy.phone}
              />
            );
          case SiteSectionId.FAQ:
            return <SiteFaqSection key={id} items={site.content.faq} />;
          case SiteSectionId.CONTACT:
            return (
              <SiteContactSection
                key={id}
                contact={site.content.contact}
                companyName={site.company.name}
                phone={copy.phone}
                email={copy.email}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function HeroBanner({
  site,
  copy,
  variant,
}: {
  site: PublicSite;
  copy: SiteHomeCopy;
  variant: "classic" | "full" | "minimal" | "inverse";
}) {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        variant === "classic" &&
          "border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent-soft",
        variant === "full" && "bg-gradient-to-br from-primary via-primary/80 to-foreground pb-16 pt-12 text-primary-foreground",
        variant === "minimal" && "py-2",
        variant === "inverse" && "text-background",
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-4",
          variant === "classic" &&
            "mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-14 lg:px-8",
          variant === "full" && "mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8",
        )}
      >
        <div className="flex items-start gap-4">
          {variant !== "inverse" ? (
            <CompanyMark
              company={site.company}
              size="lg"
              className="h-16 w-16 rounded-2xl"
            />
          ) : null}
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-medium",
                variant === "full" || variant === "inverse"
                  ? "text-inherit opacity-80"
                  : "text-primary",
              )}
            >
              {site.company.name}
            </p>
            <h1
              className={cn(
                "mt-1 font-semibold tracking-tight",
                variant === "minimal" ? "text-2xl" : "text-3xl",
                variant === "full" || variant === "inverse"
                  ? "text-inherit"
                  : "text-foreground",
              )}
            >
              {copy.headline}
            </h1>
            {copy.intro ? (
              <p
                className={cn(
                  "mt-3 max-w-2xl text-sm leading-relaxed",
                  variant === "full" || variant === "inverse"
                    ? "text-inherit opacity-80"
                    : "text-muted-foreground",
                )}
              >
                {copy.intro}
              </p>
            ) : null}
          </div>
        </div>
        {variant === "classic" ? <ContactRow copy={copy} /> : null}
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

function ContactAside({ copy }: { copy: SiteHomeCopy }) {
  const t = useTranslations("site");
  return (
    <aside className="h-fit rounded-2xl border border-border bg-surface p-4">
      <p className="text-sm font-semibold text-foreground">{t("editSection.contact")}</p>
      <div className="mt-3">
        <ContactRow copy={copy} />
      </div>
    </aside>
  );
}
