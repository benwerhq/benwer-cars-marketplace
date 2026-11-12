"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { MARKETPLACE_BANNERS, type MarketplaceBanner } from "@/data/marketplaceBanners";
import { useCarousel } from "@/hooks/useCarousel";
import { cn } from "@/lib/utils";

function BannerCopy({ banner, active }: { banner: MarketplaceBanner; active: boolean }) {
  const t = useTranslations(`marketplaceBanners.${banner.id}`);
  const { layout } = banner;
  const sizes = {
    "--banner-script": `${layout.script}cqw`,
    "--banner-highlight": `${layout.highlight}cqw`,
    "--banner-joiner": `${layout.joiner}cqw`,
    "--banner-boxed": `${layout.boxed}cqw`,
    "--banner-indent": `${layout.boxedIndent}cqw`,
    "--banner-description": `${layout.description}cqw`,
    "--banner-description-width": `${layout.descriptionWidth}cqw`,
    "--banner-cta": `${layout.cta}cqw`,
  } as CSSProperties;

  return (
    <div style={sizes} className="flex flex-col items-start text-promo-foreground">
      <p className="font-promo-script -rotate-3 text-3xl leading-none md:text-(length:--banner-script)">
        {t("script")}
      </p>
      <p className="font-promo-display mt-2 -rotate-2 bg-promo-accent px-3 py-1 text-4xl leading-none font-semibold tracking-wide text-promo-ink uppercase md:mt-[0.5cqw] md:-ml-[1cqw] md:px-[0.85cqw] md:py-[0.4cqw] md:text-(length:--banner-highlight)">
        {t("highlight")}
      </p>
      <div className="mt-1.5 flex items-center gap-2 md:mt-[0.1cqw] md:gap-[0.8cqw] md:pl-(--banner-indent)">
        <span className="font-promo-script text-3xl leading-none text-promo-accent md:text-(length:--banner-joiner)">
          {t("joiner")}
        </span>
        <span className="font-promo-display -rotate-2 bg-promo-paper px-3 py-1 text-2xl leading-none font-semibold tracking-wide text-promo-ink uppercase md:px-[0.75cqw] md:py-[0.45cqw] md:text-(length:--banner-boxed)">
          {t("boxed")}
        </span>
      </div>
      <p className="mt-4 max-w-xs text-sm leading-snug md:mt-[1.1cqw] md:max-w-(--banner-description-width) md:text-(length:--banner-description)">
        {t("description")}
      </p>
      <Link
        href={banner.href}
        tabIndex={active ? 0 : -1}
        className="mt-4 inline-flex cursor-pointer items-center rounded-sm bg-promo-paper px-4 py-2 text-sm font-medium text-promo-ink transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-promo-accent focus-visible:ring-offset-2 focus-visible:ring-offset-promo md:mt-[1cqw] md:px-[1cqw] md:py-[0.55cqw] md:text-(length:--banner-cta)"
      >
        {t("cta")}
      </Link>
    </div>
  );
}

interface MarketplaceBannerCarouselProps {
  children?: ReactNode;
}

export function MarketplaceBannerCarousel({ children }: MarketplaceBannerCarouselProps) {
  const t = useTranslations("marketplaceBanners");
  const count = MARKETPLACE_BANNERS.length;
  const { active, setIndex, go, interactionHandlers } = useCarousel(count);
  const control =
    "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-promo-paper text-promo-ink shadow-lg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-promo-accent";

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("aria")}
      className="relative mx-auto w-full max-w-7xl px-4 pt-6 md:px-6 lg:px-8"
      {...interactionHandlers}
    >
      <div className="overflow-hidden rounded-3xl bg-promo">
      <div className="@container relative md:aspect-[4/1]">
        {MARKETPLACE_BANNERS.map((banner, position) => {
          const isActive = position === active;
          return (
            <div
              key={banner.id}
              role="group"
              aria-roledescription="slide"
              aria-label={t("slideLabel", { position: position + 1, count })}
              aria-hidden={!isActive}
              className={cn(
                "transition-opacity duration-500 motion-reduce:transition-none md:absolute md:inset-0",
                isActive ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
              )}
            >
              <div className="relative aspect-[16/9] w-full md:absolute md:inset-0 md:aspect-auto">
                <Image
                  src={banner.imageSrc}
                  alt=""
                  fill
                  priority={position === 0}
                  sizes="(min-width: 1280px) 1248px, 100vw"
                  className="object-cover object-[62%_50%] md:object-center"
                />
              </div>
              <div className="relative px-5 pt-5 pb-14 md:absolute md:inset-y-0 md:left-0 md:flex md:items-center md:p-0 md:pl-[3.4cqw]">
                <BannerCopy banner={banner} active={isActive} />
              </div>
            </div>
          );
        })}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-promo/70 px-2.5 py-1.5 backdrop-blur-sm">
          {MARKETPLACE_BANNERS.map((banner, position) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={t("goTo", { position: position + 1 })}
              aria-current={position === active}
              className={cn(
                "h-2 cursor-pointer rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-promo-accent",
                position === active ? "w-6 bg-promo-paper" : "w-2 bg-promo-paper/50",
              )}
            />
          ))}
        </div>
      </div>
      {children ? <div aria-hidden className="h-12 md:h-16" /> : null}
      </div>
      {children ? (
        <div className="relative z-10 -mt-10 px-2 md:-mt-12 md:px-10">{children}</div>
      ) : null}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label={t("previous")}
        className={cn(control, "absolute top-[38%] left-1 hidden md:inline-flex lg:left-3")}
      >
        <ChevronLeft size={20} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label={t("next")}
        className={cn(control, "absolute top-[38%] right-1 hidden md:inline-flex lg:right-3")}
      >
        <ChevronRight size={20} aria-hidden />
      </button>
    </section>
  );
}
