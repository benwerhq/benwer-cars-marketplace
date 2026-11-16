"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, MailWarning } from "lucide-react";
import { useTranslations } from "next-intl";
import { useOptionalGuestAuth } from "@/context/GuestAuthProvider";

interface GuestVerifyBannerProps {
  profileHref: string;
  bookingsHref: string;
}

export function GuestVerifyBanner({
  profileHref,
  bookingsHref,
}: GuestVerifyBannerProps) {
  const t = useTranslations("guest");
  const pathname = usePathname();
  const auth = useOptionalGuestAuth();
  const user = auth?.ready && auth.configured ? auth.user : null;
  const onAccountPage = [profileHref, bookingsHref].some(
    (href) => href.split("?")[0] === pathname,
  );

  if (!user || auth?.emailVerified || onAccountPage) {
    return null;
  }

  return (
    <div
      role="status"
      className="w-full border-b border-warning/40 bg-warning-soft"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 md:px-6 lg:px-8">
        <p className="flex min-w-0 items-center gap-2 text-sm text-foreground">
          <MailWarning
            size={16}
            className="shrink-0 text-warning"
            aria-hidden
          />
          <span>{t("verifyBanner", { email: user.email ?? "" })}</span>
        </p>
        <Link
          href={profileHref}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t("verifyBannerAction")}
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
