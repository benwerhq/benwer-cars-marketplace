"use client";

import { ArrowUpRight, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { SiteSectionId } from "@/enums";
import { cn } from "@/lib/utils";
import type { SiteReviewsContent } from "@/types/siteContent";
import { SiteSectionHeading } from "./SiteSectionHeading";

function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <span role="img" aria-label={label} className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={16}
          aria-hidden
          className={cn(
            value <= Math.round(rating)
              ? "fill-warning text-warning"
              : "fill-surface-muted text-border-strong",
          )}
        />
      ))}
    </span>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function SiteReviewsSection({ reviews }: { reviews: SiteReviewsContent }) {
  const t = useTranslations("siteSections.reviews");
  const headingId = `${SiteSectionId.REVIEWS}-heading`;
  const average =
    reviews.score ??
    reviews.items.reduce((sum, item) => sum + item.rating, 0) /
      Math.max(reviews.items.length, 1);
  const total = reviews.count ?? reviews.items.length;

  return (
    <section
      id={SiteSectionId.REVIEWS}
      aria-labelledby={headingId}
      className="flex scroll-mt-24 flex-col gap-8"
    >
      <SiteSectionHeading
        id={headingId}
        eyebrow={t("eyebrow")}
        title={t("title")}
        action={
          reviews.sourceUrl ? (
            <a
              href={reviews.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {reviews.sourceLabel
                ? t("seeAllOn", { count: total, source: reviews.sourceLabel })
                : t("seeAll", { count: total })}
              <ArrowUpRight size={16} aria-hidden />
            </a>
          ) : null
        }
      />
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-2 rounded-2xl bg-surface-muted p-6">
          <p className="text-6xl font-semibold tracking-tight text-foreground tabular-nums">
            {average.toFixed(1)}
          </p>
          <Stars rating={average} label={t("ratingAria", { rating: average.toFixed(1) })} />
          <p className="text-sm text-muted-foreground">
            {reviews.sourceLabel
              ? t("basedOnSource", { count: total, source: reviews.sourceLabel })
              : t("basedOn", { count: total })}
          </p>
        </div>
        <ul className="grid gap-4 md:grid-cols-2">
          {reviews.items.map((review) => (
            <li
              key={review.id}
              className="flex flex-col rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                >
                  {initials(review.author)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {review.author}
                  </p>
                  {review.origin || review.date ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {[review.origin, review.date].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </div>
                <Stars
                  rating={review.rating}
                  label={t("ratingAria", { rating: review.rating })}
                />
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                {review.text}
              </blockquote>
              {review.vehicle ? (
                <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                  {t("rented", { vehicle: review.vehicle })}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
