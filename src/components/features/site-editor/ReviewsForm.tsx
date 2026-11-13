"use client";

import { ExternalLink, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { env } from "@/env";
import { isDemoReviews } from "@/lib/demoReviews";
import { DEFAULT_ADMIN_ORIGIN } from "@/lib/siteEdit";
import type { SiteReviewsContent } from "@/types/siteContent";
import { EditorGroup } from "./EditorPrimitives";

export function ReviewsForm({ reviews }: { reviews: SiteReviewsContent }) {
  const t = useTranslations("siteEditor.reviews");
  const origin = (env.NEXT_PUBLIC_ADMIN_URL || DEFAULT_ADMIN_ORIGIN).replace(/\/$/, "");

  return (
    <EditorGroup title={t("title")} description={t("description")}>
      <div className="flex items-center gap-3 rounded-md bg-surface-muted px-3 py-3">
        <Star size={20} className="fill-warning text-warning" aria-hidden />
        <p className="text-sm text-foreground">
          {reviews.count > 0
            ? t("summary", {
                average: (reviews.average ?? 0).toFixed(1),
                count: reviews.count,
              })
            : t("none")}
        </p>
      </div>
      {isDemoReviews(reviews) ? (
        <p className="text-xs text-muted-foreground">{t("demo")}</p>
      ) : null}
      <a
        href={`${origin}/website?tab=reviews`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t("manage")}
        <ExternalLink size={14} aria-hidden />
      </a>
    </EditorGroup>
  );
}
