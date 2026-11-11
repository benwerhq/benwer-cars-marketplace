"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { localizedText } from "@/lib/localizedCopy";
import { cn } from "@/lib/utils";
import type { SiteBanner } from "@/types/siteContent";

const ROTATE_MS = 6000;

interface SiteBannerCarouselProps {
  banners: SiteBanner[];
  companyName: string;
}

export function SiteBannerCarousel({
  banners,
  companyName,
}: SiteBannerCarouselProps) {
  const t = useTranslations("siteSections.banners");
  const locale = useLocale();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const count = banners.length;
  const active = count > 0 ? Math.min(index, count - 1) : 0;

  const go = useCallback(
    (direction: -1 | 1) => setIndex((current) => (current + direction + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused || hovered || reducedMotion) {
      return;
    }
    const timer = window.setInterval(() => go(1), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [count, paused, hovered, reducedMotion, go]);

  if (count === 0) {
    return (
      <div
        aria-hidden
        className="h-56 w-full rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-secondary md:h-80"
      />
    );
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("aria", { name: companyName })}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <div className="relative h-56 w-full overflow-hidden rounded-3xl bg-surface-muted md:h-[27.5rem]">
        {banners.map((banner, position) => {
          const title = localizedText(banner.title, locale);
          const subtitle = localizedText(banner.subtitle, locale);
          const slide = (
            <>
              {banner.imageUrl ? (
                <Image
                  src={banner.imageUrl}
                  alt={title || t("slideAlt", { position: position + 1, name: companyName })}
                  fill
                  sizes="(min-width: 1280px) 1248px, 100vw"
                  priority={position === 0}
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary" />
              )}
              {title || subtitle ? (
                <div className="absolute inset-x-0 top-0 flex flex-col gap-2 bg-gradient-to-b from-secondary/70 to-transparent p-6 pb-16 text-secondary-foreground md:p-10 md:pb-24">
                  {title ? (
                    <p className="max-w-2xl text-2xl font-semibold tracking-tight md:text-4xl">
                      {title}
                    </p>
                  ) : null}
                  {subtitle ? (
                    <p className="max-w-xl text-sm md:text-base">{subtitle}</p>
                  ) : null}
                </div>
              ) : null}
            </>
          );

          return (
            <div
              key={banner.id}
              role="group"
              aria-roledescription="slide"
              aria-label={t("slideLabel", { position: position + 1, count })}
              aria-hidden={position !== active}
              className={cn(
                "absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none",
                position === active ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              {banner.linkUrl ? (
                <a
                  href={banner.linkUrl}
                  tabIndex={position === active ? 0 : -1}
                  className="absolute inset-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  {slide}
                </a>
              ) : (
                slide
              )}
            </div>
          );
        })}
      </div>
      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t("previous")}
            className="absolute top-1/3 left-3 hidden h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground shadow-lg transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex lg:-left-5"
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t("next")}
            className="absolute top-1/3 right-3 hidden h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground shadow-lg transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex lg:-right-5"
          >
            <ChevronRight size={20} aria-hidden />
          </button>
          <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-secondary/50 px-2 py-1.5 backdrop-blur-sm md:bottom-24">
            {banners.map((banner, position) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setIndex(position)}
                aria-label={t("goTo", { position: position + 1 })}
                aria-current={position === active}
                className={cn(
                  "h-2 cursor-pointer rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  position === active ? "w-6 bg-secondary-foreground" : "w-2 bg-secondary-foreground/50",
                )}
              />
            ))}
            {reducedMotion ? null : (
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? t("play") : t("pause")}
                className="ml-1 inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {paused ? <Play size={12} aria-hidden /> : <Pause size={12} aria-hidden />}
              </button>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
