"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { SiteSectionId } from "@/enums";
import { cn } from "@/lib/utils";

interface SiteNavProps {
  homeHref: string;
  fleetHref: string;
  sections?: SiteSectionId[];
}

export function SiteNav({ homeHref, fleetHref, sections = [] }: SiteNavProps) {
  const t = useTranslations("nav");
  const tSections = useTranslations("siteSections.nav");
  const pathname = usePathname();
  const isHome = pathname === homeHref.split("?")[0];
  const fleetPath = fleetHref.split("?")[0] ?? "";

  const links = [
    {
      href: homeHref,
      label: t("home"),
      isActive: isHome,
      hideOnMobile: true,
      hidden: sections.length > 0,
    },
    {
      href: fleetHref,
      label: t("cars"),
      isActive:
        pathname.includes("/cars") ||
        pathname.includes("/book") ||
        pathname.includes("/search") ||
        pathname.startsWith(fleetPath),
    },
    ...sections.map((id) => ({
      href: `${homeHref.split("#")[0]}#${id}`,
      label: tSections(id),
      isActive: false,
      hideOnMobile: true,
      hideBelowLarge: true,
    })),
  ];

  return (
    <nav className="flex items-center gap-1" aria-label={t("mainAria")}>
      {links.filter((link) => !("hidden" in link && link.hidden)).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={link.isActive ? "page" : undefined}
          className={cn(
            "inline-flex cursor-pointer items-center rounded-full px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            link.hideOnMobile && "max-sm:hidden",
            "hideBelowLarge" in link && link.hideBelowLarge && "max-lg:hidden",
            link.isActive
              ? "bg-primary/10 font-medium text-primary"
              : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
