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
        "inline-flex cursor-pointer items-center rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-foreground transition-colors",
        "hover:bg-surface-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      {ready ? label : t("signInNav")}
    </Link>
  );
}
