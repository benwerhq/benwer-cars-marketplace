"use client";

import { BadgeCheck, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { SiteSectionId } from "@/enums";
import { cn } from "@/lib/utils";
import type { SiteReviewsContent } from "@/types/siteContent";
import { SiteSectionHeading } from "./SiteSectionHeading";

const MAX_SHOWN = 6;

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

function reviewDate(value: string, locale: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(date);
}

export function SiteReviewsSection({ reviews }: { reviews: SiteReviewsContent }) {
  const t = useTranslations("siteSections.reviews");
  const locale = useLocale();
  const headingId = `${SiteSectionId.REVIEWS}-heading`;
  const average =
    reviews.average ??
    reviews.items.reduce((sum, item) => sum + item.rating, 0) /
      Math.max(reviews.items.length, 1);
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    share:
      reviews.items.filter((item) => item.rating === rating).length /
      Math.max(reviews.items.length, 1),
  }));

  return (
    <section
      id={SiteSectionId.REVIEWS}
      aria-labelledby={headingId}
      className="flex scroll-mt-24 flex-col gap-8"
    >
      <SiteSectionHeading id={headingId} eyebrow={t("eyebrow")} title={t("title")} />
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-2 rounded-2xl bg-surface-muted p-6">
          <p className="text-6xl font-semibold tracking-tight text-foreground tabular-nums">
            {average.toFixed(1)}
          </p>
          <Stars rating={average} label={t("ratingAria", { rating: average.toFixed(1) })} />
          <p className="text-sm text-muted-foreground">
            {t("basedOn", { count: reviews.count })}
          </p>
          <ul className="mt-4 flex flex-col gap-1.5" aria-label={t("distributionAria")}>
            {distribution.map((row) => (
              <li
                key={row.rating}
                className="grid grid-cols-[1rem_minmax(0,1fr)_2.5rem] items-center gap-2 text-xs text-muted-foreground"
              >
                <span>{row.rating}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-border">
                  <span
                    className="block h-full rounded-full bg-warning"
                    style={{ width: `${Math.round(row.share * 100)}%` }}
                  />
                </span>
                <span className="text-right tabular-nums">{Math.round(row.share * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
        <ul className="grid gap-4 md:grid-cols-2">
          {reviews.items.slice(0, MAX_SHOWN).map((review) => (
            <li
              key={review.id}
              className="flex flex-col rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <Stars rating={review.rating} label={t("ratingAria", { rating: review.rating })} />
                <span className="text-xs text-muted-foreground">
                  {reviewDate(review.createdAt, locale)}
                </span>
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                {review.text}
              </blockquote>
              <p className="mt-4 inline-flex items-center gap-1.5 border-t border-border pt-3 text-xs font-semibold text-success">
                <BadgeCheck size={14} aria-hidden />
                {t("verified")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
