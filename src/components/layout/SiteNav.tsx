"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SiteSectionId } from "@/enums";
import { cn } from "@/lib/utils";
import { HEADER_ICON_BUTTON, MENU_CONTENT, MENU_ITEM } from "./LocaleSwitcher";

interface SiteNavProps {
  homeHref: string;
  fleetHref: string;
  sections?: SiteSectionId[];
}

const FLEET_SEGMENT = /\/(?:cars|search)(?:\/|$)/;

function pathOf(href: string): string {
  return href.split(/[?#]/)[0] || "/";
}

export function SiteNav({ homeHref, fleetHref, sections = [] }: SiteNavProps) {
  const t = useTranslations("nav");
  const tSections = useTranslations("siteSections.nav");
  const pathname = usePathname();
  const homePath = pathOf(homeHref);
  const isHome = pathname === homePath;
  const sectionBase = homeHref.split("#")[0];

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
      isActive: FLEET_SEGMENT.test(pathname),
    },
    ...sections.map((id) => ({
      href: `${sectionBase}#${id}`,
      label: tSections(id),
      isActive: false,
      hideOnMobile: true,
      hideBelowLarge: true,
    })),
  ];

  const menuLinks = [
    ...(sections.length > 0 ? [] : [{ href: homeHref, label: t("home"), smOnly: true }]),
    ...sections.map((id) => ({ href: `${sectionBase}#${id}`, label: tSections(id), smOnly: false })),
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
      {menuLinks.length > 0 ? (
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={t("menu")}
              className={cn(
                HEADER_ICON_BUTTON,
                sections.length > 0 ? "lg:hidden" : "sm:hidden",
              )}
            >
              <Menu size={16} aria-hidden />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" sideOffset={6} className={MENU_CONTENT}>
              {menuLinks.map((link) => (
                <DropdownMenu.Item key={link.href} asChild className={MENU_ITEM}>
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      ) : null}
    </nav>
  );
}
