"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { NavRoutes } from "@/enums";
import { cn } from "@/lib/utils";
import { HEADER_ICON_BUTTON, MENU_CONTENT, MENU_ITEM } from "./LocaleSwitcher";

/** Links that do not fit the header on phones; they move into the menu button there. */
const MOBILE_MENU_ROUTES: string[] = [NavRoutes.HOME, NavRoutes.CONTACT];

export function MarketplaceNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const links = [
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
            MOBILE_MENU_ROUTES.includes(link.href) && "max-sm:hidden",
            link.isActive
              ? "bg-primary/10 font-medium text-primary"
              : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={t("menu")}
            className={cn(HEADER_ICON_BUTTON, "sm:hidden")}
          >
            <Menu size={16} aria-hidden />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="end" sideOffset={6} className={MENU_CONTENT}>
            {links
              .filter((link) => MOBILE_MENU_ROUTES.includes(link.href))
              .map((link) => (
                <DropdownMenu.Item key={link.href} asChild className={MENU_ITEM}>
                  <Link
                    href={link.href}
                    aria-current={link.isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </DropdownMenu.Item>
              ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </nav>
  );
}
