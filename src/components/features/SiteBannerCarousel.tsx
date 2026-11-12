"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCarousel } from "@/hooks/useCarousel";
import { localizedText } from "@/lib/localizedCopy";
import { bannerImages } from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import type {
  LocalizedCopy,
  SiteBanner,
  SiteBannerTheme,
} from "@/types/siteContent";

type BannerField = "script" | "highlight" | "joiner" | "boxed" | "description";

export function useBannerCopy() {
  const t = useTranslations("siteSections.banners.presets");
  const locale = useLocale();

  return (banner: SiteBanner, field: BannerField): string => {
    const own = localizedText(banner[field] as LocalizedCopy, locale);
    if (own) {
      return own;
    }
    if (banner.preset) {
      return t(`${banner.preset}.${field}`);
    }
    return "";
  };
}

export function bannerThemeStyle(theme: SiteBannerTheme): CSSProperties {
  return {
    "--banner-bg": theme.background,
    "--banner-highlight": theme.highlight,
    "--banner-highlight-text": theme.highlightText,
    "--banner-box": theme.box,
    "--banner-box-text": theme.boxText,
    "--banner-script": theme.script,
    "--banner-text": theme.text,
  } as CSSProperties;
}

export function BannerSlideContent({
  banner,
  priority,
}: {
  banner: SiteBanner;
  priority: boolean;
}) {
  const copy = useBannerCopy();
  const images = bannerImages(banner);
  const script = copy(banner, "script");
  const highlight = copy(banner, "highlight");
  const joiner = copy(banner, "joiner");
  const boxed = copy(banner, "boxed");
  const description = copy(banner, "description");

  return (
    <>
      {images ? (
        <>
          <div className="relative mx-auto aspect-square w-full max-w-sm md:hidden">
            <Image
              src={images.mobile}
              alt=""
              fill
              priority={priority}
              unoptimized
              sizes="100vw"
              className="object-contain object-center"
            />
          </div>
          <div className="absolute inset-y-[4%] right-[2%] hidden w-[60%] md:block">
            <Image
              src={images.desktop}
              alt=""
              fill
              priority={priority}
              unoptimized
              sizes="60vw"
              className="object-contain object-center"
            />
          </div>
        </>
      ) : null}
      <div className="relative flex flex-col items-start px-5 pt-4 pb-14 text-(--banner-text) md:absolute md:inset-y-0 md:left-0 md:justify-center md:p-0 md:pl-[3.4cqw]">
        {script ? (
          <p className="font-promo-script -rotate-3 text-4xl leading-none text-(--banner-text) md:text-[3cqw]">
            {script}
          </p>
        ) : null}
        {highlight ? (
          <p className="font-promo-display mt-2 -rotate-2 bg-(--banner-highlight) px-3 py-1 text-5xl leading-none text-(--banner-highlight-text) uppercase md:-ml-[0.6cqw] md:mt-[0.5cqw] md:px-[0.85cqw] md:py-[0.4cqw] md:text-[4.7cqw]">
            {highlight}
          </p>
        ) : null}
        {joiner || boxed ? (
          <div className="mt-1.5 flex items-center gap-2 md:mt-[0.2cqw] md:gap-[0.8cqw] md:pl-[1.4cqw]">
            {joiner ? (
              <span className="font-promo-script text-4xl leading-none text-(--banner-script) md:text-[3cqw]">
                {joiner}
              </span>
            ) : null}
            {boxed ? (
              <span className="font-promo-display -rotate-2 bg-(--banner-box) px-3 py-1 text-3xl leading-none text-(--banner-box-text) uppercase md:px-[0.75cqw] md:py-[0.45cqw] md:text-[3.6cqw]">
                {boxed}
              </span>
            ) : null}
          </div>
        ) : null}
        {description ? (
          <p className="mt-4 max-w-sm text-base leading-snug md:mt-[1.2cqw] md:max-w-[30cqw] md:text-[1.4cqw]">
            {description}
          </p>
        ) : null}
      </div>
    </>
  );
}

interface SiteBannerCarouselProps {
  banners: SiteBanner[];
  theme: SiteBannerTheme;
  companyName: string;
  underSearch?: boolean;
}

export function SiteBannerCarousel({
  banners,
  theme,
  companyName,
  underSearch = false,
}: SiteBannerCarouselProps) {
  const t = useTranslations("siteSections.banners");
  const count = banners.length;
  const { active, setIndex, go, interactionHandlers } = useCarousel(count);
  const control =
    "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground shadow-lg transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const searchSpace = underSearch ? (
    <div aria-hidden className="h-12 md:h-16" />
  ) : null;

  if (count === 0) {
    return (
      <div
        aria-hidden
        style={bannerThemeStyle(theme)}
        className="w-full overflow-hidden rounded-3xl bg-(--banner-bg)"
      >
        <div className="h-40 md:aspect-[4/1] md:h-auto" />
        {searchSpace}
      </div>
    );
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("aria", { name: companyName })}
      style={bannerThemeStyle(theme)}
      className="relative"
      {...interactionHandlers}
    >
      <div className="overflow-hidden rounded-3xl bg-(--banner-bg)">
        <div className="@container relative md:aspect-[4/1]">
          {banners.map((banner, position) => {
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
                  isActive
                    ? "relative opacity-100"
                    : "pointer-events-none absolute inset-0 opacity-0",
                )}
              >
                <BannerSlideContent banner={banner} priority={position === 0} />
              </div>
            );
          })}
          {count > 1 ? (
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-2.5 py-1.5 backdrop-blur-sm md:bottom-[6%]">
              {banners.map((banner, position) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setIndex(position)}
                  aria-label={t("goTo", { position: position + 1 })}
                  aria-current={position === active}
                  className={cn(
                    "h-2 cursor-pointer rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                    position === active ? "w-6 bg-white" : "w-2 bg-white/50",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
        {searchSpace}
      </div>
      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t("previous")}
            className={cn(
              control,
              "absolute top-[38%] left-3 hidden md:inline-flex lg:-left-5",
            )}
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t("next")}
            className={cn(
              control,
              "absolute top-[38%] right-3 hidden md:inline-flex lg:-right-5",
            )}
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </>
      ) : null}
    </section>
  );
}
