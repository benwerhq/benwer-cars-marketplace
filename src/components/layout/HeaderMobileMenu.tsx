"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, ChevronLeft, ChevronRight, Globe, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { filterLocales } from "@/i18n/localeSearch";
import { resolveLocale, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useColorSchemeToggle } from "./ColorSchemeSwitcher";
import { LocaleFlag } from "./LocaleFlag";
import {
  HEADER_ICON_BUTTON,
  LOCALE_NAME_KEYS,
  useLocaleSelect,
} from "./LocaleSwitcher";

export interface HeaderMenuLink {
  href: string;
  label: string;
  isActive: boolean;
}

export function headerNavLinkClass(isActive: boolean): string {
  return cn(
    "header-nav-link inline-flex cursor-pointer items-center rounded-full px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    isActive
      ? "bg-primary/10 font-medium text-primary"
      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
  );
}

export const MENU_SEPARATOR = "my-2 h-px bg-border";

export const MENU_LABEL = "truncate px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground";

export const MOBILE_MENU_ITEM =
  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

interface HeaderMobileMenuProps {
  links: HeaderMenuLink[];
  children?: ReactNode;
  triggerClassName?: string;
}

export function HeaderMobileMenu({
  links,
  children,
  triggerClassName,
}: HeaderMobileMenuProps) {
  const t = useTranslations("nav");
  const tLocale = useTranslations("locale");
  const tActions = useTranslations("actions");
  const { locale, select, isPending } = useLocaleSelect();
  const scheme = useColorSchemeToggle();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"main" | "language">("main");
  const [query, setQuery] = useState("");

  const currentLocale = resolveLocale(locale);
  const filteredLocales = useMemo(
    () => filterLocales(routing.locales, (code) => tLocale(LOCALE_NAME_KEYS[code]), query),
    [query, tLocale],
  );

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setView("main");
      setQuery("");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={t("menu")}
          data-testid="header-mobile-menu"
          className={cn(HEADER_ICON_BUTTON, triggerClassName)}
        >
          <Menu size={16} aria-hidden />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed inset-x-0 top-0 z-[60] flex max-h-[100dvh] w-full flex-col border-b border-border bg-surface shadow-xl outline-none">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            {view === "language" ? (
              <div className="flex min-w-0 items-center gap-1">
                <button
                  type="button"
                  aria-label={tActions("back")}
                  onClick={() => {
                    setView("main");
                    setQuery("");
                  }}
                  className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ChevronLeft size={18} aria-hidden />
                </button>
                <Dialog.Title className="truncate text-base font-semibold text-foreground">
                  {tLocale("label")}
                </Dialog.Title>
              </div>
            ) : (
              <Dialog.Title className="truncate text-base font-semibold text-foreground">
                {t("menu")}
              </Dialog.Title>
            )}
            <Dialog.Description className="sr-only">
              {view === "language" ? tLocale("label") : t("menu")}
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={tActions("close")}
                className={HEADER_ICON_BUTTON}
              >
                <X size={16} aria-hidden />
              </button>
            </Dialog.Close>
          </div>

          {view === "language" ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="border-b border-border px-4 py-3">
                <div className="relative">
                  <Search
                    size={15}
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={tLocale("search")}
                    aria-label={tLocale("search")}
                    className="h-10 w-full rounded-xl border border-border bg-background pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {filteredLocales.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {tLocale("noResults")}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {filteredLocales.map((code) => {
                      const active = currentLocale === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          lang={code}
                          disabled={isPending}
                          aria-pressed={active}
                          onClick={() => {
                            select(code);
                            handleOpenChange(false);
                          }}
                          className={cn(
                            MOBILE_MENU_ITEM,
                            active
                              ? "bg-primary/10 font-medium text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <LocaleFlag locale={code} />
                          <span className="min-w-0 flex-1 truncate">
                            {tLocale(LOCALE_NAME_KEYS[code])}
                          </span>
                          {active ? (
                            <Check size={16} className="shrink-0 text-primary" aria-hidden />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 py-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <nav className="flex flex-col gap-1" aria-label={t("mainAria")}>
                {links.map((link) => (
                  <Dialog.Close key={link.href} asChild>
                    <Link
                      href={link.href}
                      aria-current={link.isActive ? "page" : undefined}
                      className={cn(
                        MOBILE_MENU_ITEM,
                        link.isActive && "bg-primary/10 font-medium text-primary",
                      )}
                    >
                      {link.label}
                    </Link>
                  </Dialog.Close>
                ))}
              </nav>
              {children}
              <div className={MENU_SEPARATOR} role="separator" />
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className={MOBILE_MENU_ITEM}
                  onClick={scheme.toggle}
                >
                  {scheme.isDark ? (
                    <Sun size={16} className="shrink-0 text-muted-foreground" aria-hidden />
                  ) : (
                    <Moon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <span className="flex-1">{scheme.label}</span>
                </button>
                <button
                  type="button"
                  className={MOBILE_MENU_ITEM}
                  onClick={() => setView("language")}
                >
                  <Globe size={16} className="shrink-0 text-muted-foreground" aria-hidden />
                  <span className="flex-1">{tLocale("label")}</span>
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <LocaleFlag locale={currentLocale} />
                    <span className="text-sm">{tLocale(LOCALE_NAME_KEYS[currentLocale])}</span>
                    <ChevronRight size={16} className="shrink-0" aria-hidden />
                  </span>
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
