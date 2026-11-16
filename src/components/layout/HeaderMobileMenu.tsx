"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Menu, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useColorSchemeToggle } from "./ColorSchemeSwitcher";
import {
  HEADER_ICON_BUTTON,
  LOCALE_NAME_KEYS,
  MENU_CONTENT,
  MENU_ITEM,
  useLocaleSelect,
} from "./LocaleSwitcher";

export interface HeaderMenuLink {
  href: string;
  label: string;
  isActive: boolean;
}

export function headerNavLinkClass(isActive: boolean): string {
  return cn(
    "inline-flex cursor-pointer items-center rounded-full px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    isActive
      ? "bg-primary/10 font-medium text-primary"
      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
  );
}

export const MENU_SEPARATOR = "my-1 h-px bg-border";

export const MENU_LABEL = "truncate px-2.5 pt-2 pb-1 text-xs font-medium text-muted-foreground";

interface HeaderMobileMenuProps {
  links: HeaderMenuLink[];
  children?: ReactNode;
}

export function HeaderMobileMenu({ links, children }: HeaderMobileMenuProps) {
  const t = useTranslations("nav");
  const tLocale = useTranslations("locale");
  const { locale, select, isPending } = useLocaleSelect();
  const scheme = useColorSchemeToggle();

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t("menu")}
          data-testid="header-mobile-menu"
          className={HEADER_ICON_BUTTON}
        >
          <Menu size={16} aria-hidden />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          collisionPadding={16}
          className={cn(
            MENU_CONTENT,
            "max-h-[var(--radix-dropdown-menu-content-available-height)] w-64 overflow-y-auto",
          )}
        >
          {links.map((link) => (
            <DropdownMenu.Item key={link.href} asChild className={MENU_ITEM}>
              <Link
                href={link.href}
                aria-current={link.isActive ? "page" : undefined}
                className={cn(link.isActive && "font-medium text-primary")}
              >
                {link.label}
              </Link>
            </DropdownMenu.Item>
          ))}
          {children}
          <DropdownMenu.Separator className={MENU_SEPARATOR} />
          <DropdownMenu.Item
            className={MENU_ITEM}
            onSelect={(event) => {
              event.preventDefault();
              scheme.toggle();
            }}
          >
            {scheme.isDark ? <Sun size={15} aria-hidden /> : <Moon size={15} aria-hidden />}
            {scheme.label}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className={MENU_SEPARATOR} />
          <DropdownMenu.Label className={MENU_LABEL}>{tLocale("label")}</DropdownMenu.Label>
          {routing.locales.map((code) => {
            const active = locale === code;
            return (
              <DropdownMenu.Item
                key={code}
                lang={code}
                disabled={isPending}
                onSelect={() => select(code)}
                className={cn(MENU_ITEM, active ? "font-medium" : "text-muted-foreground")}
              >
                <span className="flex-1">{tLocale(LOCALE_NAME_KEYS[code])}</span>
                {active ? <Check size={14} className="shrink-0 text-primary" aria-hidden /> : null}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
