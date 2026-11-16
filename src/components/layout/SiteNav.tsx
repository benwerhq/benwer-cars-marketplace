"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SiteSectionId } from "@/enums";
import { formatPhoneDisplay, phoneTelHref } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { HeaderMobileMenu, type HeaderMenuLink } from "./HeaderMobileMenu";
import { SiteCartMenuItem } from "./SiteCartLink";
import { SiteAccountMenuItems } from "./SiteGuestLink";
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

function useSiteLinks({ homeHref, fleetHref, sections = [] }: SiteNavProps): HeaderMenuLink[] {
  const t = useTranslations("nav");
  const tSections = useTranslations("siteSections.nav");
  const pathname = usePathname();
  const sectionBase = homeHref.split("#")[0];

  return [
    { href: homeHref, label: t("home"), isActive: pathname === pathOf(homeHref) },
    { href: fleetHref, label: t("cars"), isActive: FLEET_SEGMENT.test(pathname) },
    ...sections.map((id) => ({
      href: `${sectionBase}#${id}`,
      label: tSections(id),
      isActive: false,
    })),
  ];
}

interface SiteMobileMenuProps extends SiteNavProps {
  phone?: string | null;
  cartSlug?: string;
}

export function SiteMobileMenu({ phone, cartSlug, ...nav }: SiteMobileMenuProps) {
  return (
    <HeaderMobileMenu links={useSiteLinks(nav)}>
      {phone ? (
        <DropdownMenu.Item asChild className={MENU_ITEM}>
          <a href={phoneTelHref(phone)}>
            <Phone size={15} aria-hidden />
            {formatPhoneDisplay(phone)}
          </a>
        </DropdownMenu.Item>
      ) : null}
      {cartSlug ? <SiteCartMenuItem slug={cartSlug} homeHref={nav.homeHref} /> : null}
      <SiteAccountMenuItems homeHref={nav.homeHref} />
    </HeaderMobileMenu>
  );
}

export function SiteNav({
  homeHref,
  fleetHref,
  sections = [],
  children,
}: SiteNavProps & { children?: ReactNode }) {
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
      hideBelowLarge: true,
    })),
  ];

  const menuLinks = sections.map((id) => ({
    href: `${sectionBase}#${id}`,
    label: tSections(id),
  }));

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
            "hideBelowLarge" in link && link.hideBelowLarge && "max-lg:hidden",
            link.isActive
              ? "bg-primary/10 font-medium text-primary"
              : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
      {children}
      {menuLinks.length > 0 ? (
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={t("menu")}
              className={cn(HEADER_ICON_BUTTON, "lg:hidden")}
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
