"use client";

import {
  Baby,
  CalendarCheck,
  Car,
  Check,
  Fuel,
  Gauge,
  KeyRound,
  Plane,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { SiteIncludedIcon, SiteSectionId } from "@/enums";
import { localizedText } from "@/lib/localizedCopy";
import type { SiteIncludedItem } from "@/types/siteContent";
import { SiteSectionHeading } from "./SiteSectionHeading";

export const INCLUDED_ICONS: Record<SiteIncludedIcon, LucideIcon> = {
  [SiteIncludedIcon.SHIELD]: ShieldCheck,
  [SiteIncludedIcon.GAUGE]: Gauge,
  [SiteIncludedIcon.FUEL]: Fuel,
  [SiteIncludedIcon.CALENDAR_CHECK]: CalendarCheck,
  [SiteIncludedIcon.CHECK]: Check,
  [SiteIncludedIcon.CAR]: Car,
  [SiteIncludedIcon.USERS]: Users,
  [SiteIncludedIcon.BABY]: Baby,
  [SiteIncludedIcon.PLANE]: Plane,
  [SiteIncludedIcon.KEY]: KeyRound,
};

export function useIncludedCopy() {
  const t = useTranslations("siteSections.included.presets");
  const locale = useLocale();

  return (item: SiteIncludedItem) => {
    const fallback = (field: "title" | "text" | "tag") =>
      item.preset ? t(`${item.preset}.${field}`) : "";
    return {
      title: localizedText(item.title, locale) || fallback("title"),
      text: localizedText(item.text, locale) || fallback("text"),
      tag: localizedText(item.tag, locale) || fallback("tag"),
    };
  };
}

export function SiteIncludedSection({ items }: { items: SiteIncludedItem[] }) {
  const t = useTranslations("siteSections.included");
  const copyFor = useIncludedCopy();
  const headingId = `${SiteSectionId.INCLUDED}-heading`;

  return (
    <section
      id={SiteSectionId.INCLUDED}
      aria-labelledby={headingId}
      className="grid scroll-mt-24 items-start gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12"
    >
      <SiteSectionHeading
        id={headingId}
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = INCLUDED_ICONS[item.icon];
          const copy = copyFor(item);
          return (
            <li
              key={item.id}
              className="flex flex-col rounded-2xl border border-border bg-surface p-5"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={20} aria-hidden />
              </span>
              <p className="mt-4 text-base font-semibold text-foreground">{copy.title}</p>
              {copy.text ? (
                <p className="mt-1 text-sm text-muted-foreground">{copy.text}</p>
              ) : null}
              {copy.tag ? (
                <span className="mt-3 inline-flex w-fit items-center rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
                  {copy.tag}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
