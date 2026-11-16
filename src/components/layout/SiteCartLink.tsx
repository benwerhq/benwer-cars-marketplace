"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { useCart } from "@/lib/cart";
import { cartHrefFromHome } from "@/lib/site";
import { cn } from "@/lib/utils";
import { HEADER_ICON_BUTTON, MENU_ITEM } from "./LocaleSwitcher";

/** Header cart icon with a count; hidden while the cart is empty. */
export function SiteCartLink({ slug, homeHref }: { slug: string; homeHref: string }) {
  const t = useTranslations("cart");
  const items = useCart(slug);

  if (items.length === 0) {
    return null;
  }

  const label = t("open", { count: items.length });
  return (
    <IconTooltip label={label}>
      <Link
        href={cartHrefFromHome(homeHref)}
        aria-label={label}
        className={cn(HEADER_ICON_BUTTON, "relative text-foreground")}
      >
        <ShoppingCart size={16} aria-hidden />
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums">
          {items.length}
        </span>
      </Link>
    </IconTooltip>
  );
}

export function SiteCartMenuItem({ slug, homeHref }: { slug: string; homeHref: string }) {
  const t = useTranslations("cart");
  const items = useCart(slug);

  if (items.length === 0) {
    return null;
  }

  return (
    <DropdownMenu.Item asChild className={MENU_ITEM}>
      <Link href={cartHrefFromHome(homeHref)}>
        <ShoppingCart size={15} aria-hidden />
        <span className="flex-1">{t("open", { count: items.length })}</span>
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums">
          {items.length}
        </span>
      </Link>
    </DropdownMenu.Item>
  );
}
