"use client";

import { useTranslations } from "next-intl";
import { SiteEditSection as SiteEditSectionId } from "@/enums";
import { env } from "@/env";
import { adminWebsiteHref, tabForSection } from "@/lib/siteEdit";
import { cn } from "@/lib/utils";

interface SiteEditSectionProps {
  section: SiteEditSectionId;
  enabled: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SiteEditSection({
  section,
  enabled,
  children,
  className,
}: SiteEditSectionProps) {
  const t = useTranslations("site");

  if (!enabled) {
    return children;
  }

  const href = adminWebsiteHref(
    tabForSection(section),
    section,
    env.NEXT_PUBLIC_ADMIN_URL,
  );

  return (
    <div className={cn("group/edit relative", className)}>
      <div className="pointer-events-none absolute inset-0 z-20 rounded-lg ring-0 ring-primary transition group-hover/edit:ring-2 group-focus-within/edit:ring-2" />
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "absolute top-2 right-2 z-30 inline-flex h-7 cursor-pointer items-center rounded-md bg-primary px-2 text-xs font-medium text-primary-foreground opacity-0 shadow-md",
          "transition-opacity group-hover/edit:opacity-100 group-focus-within/edit:opacity-100",
          "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        {t("editLink")}
      </a>
      {children}
    </div>
  );
}
