"use client";

import { MapPin, Navigation, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { SiteSectionId } from "@/enums";
import type { SiteBranch } from "@/types/site";
import { SiteSectionHeading } from "./SiteSectionHeading";

function directionsHref(branch: SiteBranch, companyName: string): string {
  const query = [companyName, branch.name, branch.address].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

interface SiteLocationsSectionProps {
  branches: SiteBranch[];
  companyName: string;
  phone: string | null;
}

export function SiteLocationsSection({
  branches,
  companyName,
  phone,
}: SiteLocationsSectionProps) {
  const t = useTranslations("siteSections.locations");
  const headingId = `${SiteSectionId.BRANCHES}-heading`;

  return (
    <section
      id={SiteSectionId.BRANCHES}
      aria-labelledby={headingId}
      className="flex scroll-mt-24 flex-col gap-8"
    >
      <SiteSectionHeading
        id={headingId}
        eyebrow={t("eyebrow")}
        title={t("title", { count: branches.length })}
        description={t("description", { count: branches.length })}
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {branches.map((branch) => (
          <li
            key={branch.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin size={18} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold text-foreground">{branch.name}</p>
                {branch.address ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">{branch.address}</p>
                ) : null}
              </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm font-medium">
              <a
                href={directionsHref(branch, companyName)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("directionsTo", { name: branch.name })}
                className="inline-flex cursor-pointer items-center gap-1.5 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Navigation size={15} aria-hidden />
                {t("directions")}
              </a>
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Phone size={15} aria-hidden />
                  {t("call")}
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
