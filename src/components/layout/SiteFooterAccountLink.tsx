"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useGuestAuth } from "@/context/GuestAuthProvider";
import { guestLinksFromHomeHref } from "@/lib/site";

export function SiteFooterAccountLink({
  homeHref,
  className,
}: {
  homeHref: string;
  className: string;
}) {
  const t = useTranslations("guest");
  const { user, ready } = useGuestAuth();
  const links = guestLinksFromHomeHref(homeHref);
  const signedIn = ready && Boolean(user);

  return (
    <Link href={signedIn ? links.bookings : links.signIn} className={className}>
      {signedIn ? t("myBookings") : t("signInNav")}
    </Link>
  );
}
