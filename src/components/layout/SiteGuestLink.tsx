"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useGuestAuth } from "@/context/GuestAuthProvider";
import { guestLinksFromHomeHref } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteGuestLink({ homeHref }: { homeHref: string }) {
  const t = useTranslations("guest");
  const { user, ready } = useGuestAuth();
  const links = guestLinksFromHomeHref(homeHref);
  const href = user ? links.bookings : links.signIn;
  const label = user ? t("myBookings") : t("signInNav");

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex cursor-pointer items-center rounded-full px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors",
        "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      {ready ? label : t("signInNav")}
    </Link>
  );
}
