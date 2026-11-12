"use client";

import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { SiteSectionId } from "@/enums";
import { localizedText } from "@/lib/localizedCopy";
import type { SiteFaqItem } from "@/types/siteContent";
import { SiteSectionHeading, type SiteSectionHeadingCopy } from "./SiteSectionHeading";

export function SiteFaqSection({
  items,
  heading,
}: {
  items: SiteFaqItem[];
  heading?: SiteSectionHeadingCopy;
}) {
  const t = useTranslations("siteSections.faq");
  const locale = useLocale();
  const headingId = `${SiteSectionId.FAQ}-heading`;

  return (
    <section
      id={SiteSectionId.FAQ}
      aria-labelledby={headingId}
      className="grid scroll-mt-24 items-start gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12"
    >
      <SiteSectionHeading
        id={headingId}
        eyebrow={heading?.eyebrow ?? t("eyebrow")}
        title={heading?.title ?? t("title")}
        description={heading ? heading.description : t("description")}
      />
      <div className="divide-y divide-border border-y border-border">
        {items.map((item, index) => (
          <details key={item.id} className="group" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              {localizedText(item.question, locale)}
              <ChevronDown
                size={18}
                aria-hidden
                className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <p className="-mt-1 pb-5 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {localizedText(item.answer, locale)}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
