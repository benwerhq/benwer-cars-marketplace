"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { NavRoutes } from "@/enums";
import { cn } from "@/lib/utils";
import { HeaderMobileMenu, type HeaderMenuLink } from "./HeaderMobileMenu";

export function useMarketplaceLinks(): HeaderMenuLink[] {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return [
    {
      href: NavRoutes.HOME,
      label: t("home"),
      isActive: pathname === NavRoutes.HOME,
    },
    {
      href: NavRoutes.CARS,
      label: t("cars"),
      isActive: pathname === NavRoutes.CARS,
    },
    {
      href: NavRoutes.COMPANIES,
      label: t("companies"),
      isActive: pathname.startsWith(NavRoutes.COMPANIES),
    },
    {
      href: NavRoutes.CONTACT,
      label: t("contact"),
      isActive: pathname === NavRoutes.CONTACT,
    },
  ];
}

export function MarketplaceMobileMenu() {
  return <HeaderMobileMenu links={useMarketplaceLinks()} />;
}

export function MarketplaceNav() {
  const t = useTranslations("nav");
  const links = useMarketplaceLinks();

  return (
    <nav className="flex items-center gap-1" aria-label={t("mainAria")}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={link.isActive ? "page" : undefined}
          className={cn(
            "inline-flex cursor-pointer items-center rounded-full px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
