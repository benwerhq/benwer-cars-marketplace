"use client";

import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { useCart } from "@/lib/cart";
import { cartHrefFromHome } from "@/lib/site";
import { cn } from "@/lib/utils";
import { MOBILE_MENU_ITEM } from "./HeaderMobileMenu";
import { HEADER_ICON_BUTTON } from "./LocaleSwitcher";

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
    <Dialog.Close asChild>
      <Link href={cartHrefFromHome(homeHref)} className={MOBILE_MENU_ITEM}>
        <ShoppingCart size={16} className="shrink-0 text-muted-foreground" aria-hidden />
        <span className="flex-1">{t("open", { count: items.length })}</span>
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums">
          {items.length}
        </span>
      </Link>
    </Dialog.Close>
  );
}
