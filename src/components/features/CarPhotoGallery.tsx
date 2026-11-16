"use client";

import { useState } from "react";
import { Car, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/Button";
import { CarPhoto } from "./CarPhoto";

interface CarPhotoGalleryProps {
  photos: string[];
  alt: string;
  className?: string;
}

export function CarPhotoGallery({
  photos,
  alt,
  className,
}: CarPhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const t = useTranslations("carDetail");

  if (photos.length === 0) {
    return (
      <div
        className={cn(
          "mx-auto flex min-h-48 w-full max-w-3xl flex-col items-center justify-center gap-3 overflow-hidden rounded-xl bg-surface-muted",
          className,
        )}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Car size={28} aria-hidden />
        </span>
        <p className="text-sm font-medium text-foreground">{alt}</p>
        <p className="text-sm text-muted-foreground">{t("photoEmpty")}</p>
      </div>
    );
  }

  const activePhoto = photos[activeIndex];

  return (
    <div
      className={cn(
        "mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-3",
        className,
      )}
    >
      <div className="group relative aspect-[16/10] min-h-48 w-full overflow-hidden rounded-xl bg-surface-muted">
        <div className="absolute inset-x-[12%] inset-y-[10%]">
          <CarPhoto
            key={activePhoto}
            src={activePhoto}
            alt={t("photoAlt", { name: alt, index: activeIndex + 1 })}
            priority
            sizes="(min-width: 768px) 36rem, 76vw"
            className="object-contain"
            fallback={
              <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                <Car size={28} className="text-primary/40" aria-hidden />
                <p className="text-sm text-muted-foreground">
                  {t("photoEmpty")}
                </p>
              </div>
            }
          />
        </div>

        {photos.length > 1 ? (
          <>
            <IconButton
              label={t("previousPhoto")}
              onClick={() =>
                setActiveIndex((i) => (i - 1 + photos.length) % photos.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 opacity-0 transition-opacity hover:bg-background group-hover:opacity-100"
            >
              <ChevronLeft size={16} aria-hidden />
            </IconButton>
            <IconButton
              label={t("nextPhoto")}
              onClick={() => setActiveIndex((i) => (i + 1) % photos.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 opacity-0 transition-opacity hover:bg-background group-hover:opacity-100"
            >
              <ChevronRight size={16} aria-hidden />
            </IconButton>
            <span className="absolute bottom-3 right-3 rounded-full bg-background/80 px-2 py-0.5 text-xs tabular-nums text-foreground">
              {t("photoIndex", {
                current: activeIndex + 1,
                total: photos.length,
              })}
            </span>
          </>
        ) : null}
      </div>

      {photos.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={t("viewPhoto", { index: i + 1 })}
              aria-pressed={i === activeIndex}
              className={cn(
                "relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 bg-surface-muted transition-colors cursor-pointer",
                i === activeIndex
                  ? "border-primary"
                  : "border-transparent hover:border-border-strong",
              )}
            >
              <CarPhoto
                key={photo}
                src={photo}
                alt={`${alt} thumbnail ${i + 1}`}
                sizes="96px"
                fallback={
                  <div className="flex h-full w-full items-center justify-center">
                    <Car size={16} className="text-primary/30" aria-hidden />
                  </div>
                }
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
