"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { SiteBannerTarget } from "@/enums";
import { useCarousel } from "@/hooks/useCarousel";
import { localizedText } from "@/lib/localizedCopy";
import { bannerImageSrc } from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import type {
  LocalizedCopy,
  SiteBanner,
  SiteBannerTheme,
} from "@/types/siteContent";

type BannerField =
  | "script"
  | "highlight"
  | "joiner"
  | "boxed"
  | "description"
  | "ctaLabel";

export function useBannerCopy() {
  const t = useTranslations("siteSections.banners.presets");
  const tDefault = useTranslations("siteSections.banners.fallback");
  const locale = useLocale();

  return (banner: SiteBanner, field: BannerField): string => {
    const own = localizedText(banner[field] as LocalizedCopy, locale);
    if (own) {
      return own;
    }
    if (banner.preset) {
      return t(`${banner.preset}.${field}`);
    }
    return field === "ctaLabel" ? tDefault("ctaLabel") : "";
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
    "--banner-button": theme.button,
    "--banner-button-text": theme.buttonText,
  } as CSSProperties;
}

function ctaHref(banner: SiteBanner, homeHref: string): string {
  const home = homeHref.split("#")[0] ?? homeHref;
  if (banner.ctaTarget === SiteBannerTarget.URL && banner.ctaUrl) {
    return banner.ctaUrl;
  }
  return `${home}#${banner.ctaTarget === SiteBannerTarget.CONTACT ? "contact" : "fleet"}`;
}

export function BannerSlideContent({
  banner,
  homeHref,
  active,
  priority,
}: {
  banner: SiteBanner;
  homeHref: string;
  active: boolean;
  priority: boolean;
}) {
  const copy = useBannerCopy();
  const image = bannerImageSrc(banner);
  const script = copy(banner, "script");
  const highlight = copy(banner, "highlight");
  const joiner = copy(banner, "joiner");
  const boxed = copy(banner, "boxed");
  const description = copy(banner, "description");
  const cta = copy(banner, "ctaLabel");
  const external =
    banner.ctaTarget === SiteBannerTarget.URL && Boolean(banner.ctaUrl);

  return (
    <>
      {image ? (
        <div className="relative aspect-[16/10] w-full md:absolute md:inset-y-[3%] md:right-[3%] md:aspect-auto md:w-[56%]">
          <Image
            src={image}
            alt=""
            fill
            priority={priority}
            unoptimized
            sizes="(min-width: 768px) 56vw, 100vw"
            className="object-contain md:object-right"
          />
        </div>
      ) : null}
      <div className="relative flex flex-col items-start px-5 pt-4 pb-14 text-(--banner-text) md:absolute md:inset-y-0 md:left-0 md:justify-center md:p-0 md:pl-[3.4cqw]">
        {script ? (
          <p className="font-promo-script -rotate-3 text-3xl leading-none text-(--banner-text) md:text-[2.6cqw]">
            {script}
          </p>
        ) : null}
        {highlight ? (
          <p className="font-promo-display mt-2 -rotate-2 bg-(--banner-highlight) px-3 py-1 text-4xl leading-none text-(--banner-highlight-text) uppercase md:-ml-[0.6cqw] md:mt-[0.5cqw] md:px-[0.85cqw] md:py-[0.4cqw] md:text-[4.1cqw]">
            {highlight}
          </p>
        ) : null}
        {joiner || boxed ? (
          <div className="mt-1.5 flex items-center gap-2 md:mt-[0.2cqw] md:gap-[0.8cqw] md:pl-[1.4cqw]">
            {joiner ? (
              <span className="font-promo-script text-3xl leading-none text-(--banner-script) md:text-[2.6cqw]">
                {joiner}
              </span>
            ) : null}
            {boxed ? (
              <span className="font-promo-display -rotate-2 bg-(--banner-box) px-3 py-1 text-2xl leading-none text-(--banner-box-text) uppercase md:px-[0.75cqw] md:py-[0.45cqw] md:text-[3.1cqw]">
                {boxed}
              </span>
            ) : null}
          </div>
        ) : null}
        {description ? (
          <p className="mt-4 max-w-xs text-sm leading-snug md:mt-[1.2cqw] md:max-w-[26cqw] md:text-[1.15cqw]">
            {description}
          </p>
        ) : null}
        {cta ? (
          <a
            href={ctaHref(banner, homeHref)}
            tabIndex={active ? 0 : -1}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="mt-4 inline-flex cursor-pointer items-center rounded-sm bg-(--banner-button) px-4 py-2 text-sm font-medium text-(--banner-button-text) transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--banner-highlight) focus-visible:ring-offset-2 focus-visible:ring-offset-(--banner-bg) md:mt-[1.3cqw] md:px-[1.05cqw] md:py-[0.6cqw] md:text-[1.1cqw]"
          >
            {cta}
          </a>
        ) : null}
      </div>
    </>
  );
}

interface SiteBannerCarouselProps {
  banners: SiteBanner[];
  theme: SiteBannerTheme;
  companyName: string;
  homeHref: string;
  underSearch?: boolean;
}

export function SiteBannerCarousel({
  banners,
  theme,
  companyName,
  homeHref,
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
                <BannerSlideContent
                  banner={banner}
                  homeHref={homeHref}
                  active={isActive}
                  priority={position === 0}
                />
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
