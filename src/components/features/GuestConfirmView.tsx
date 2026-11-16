"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { GuestDisabledState } from "@/components/features/GuestDisabledState";
import { GuestSignInPanel } from "@/components/features/GuestSignInPanel";
import { PageLoadError } from "@/components/ui/PageLoadError";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGuestAuth } from "@/context/GuestAuthProvider";
import { isGuestNotConfiguredError } from "@/lib/guestAccount";
import { getErrorKey } from "@/lib/errors";
import { useConfirmGuestLink } from "@/hooks/useGuestAccount";
import { useReturnAfterSignIn } from "@/hooks/useReturnAfterSignIn";

interface GuestConfirmViewProps {
  companySlug: string;
  token: string;
  bookingsHref: string;
}

export function GuestConfirmView({
  companySlug,
  token,
  bookingsHref,
}: GuestConfirmViewProps) {
  const t = useTranslations("guest");
  const tRoot = useTranslations();
  const router = useRouter();
  const { user, ready, configured } = useGuestAuth();
  const returning = useReturnAfterSignIn(Boolean(user));
  const { mutateAsync, isError, error } = useConfirmGuestLink(companySlug);
  const started = useRef(false);

  useEffect(() => {
    if (!ready || !configured || !user || !token || started.current) {
      return;
    }

    started.current = true;
    void mutateAsync(token)
      .then(() => {
        router.replace(bookingsHref);
      })
      .catch(() => undefined);
  }, [bookingsHref, configured, mutateAsync, ready, router, token, user]);

  if (!ready || returning) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!configured || isGuestNotConfiguredError(error)) {
    return <GuestDisabledState />;
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">{t("confirmSignIn")}</p>
        <GuestSignInPanel />
      </div>
    );
  }

  if (!token) {
    return (
      <PageLoadError title={t("confirmMissing")} description={t("confirmMissingHint")} />
    );
  }

  if (isError) {
    return (
      <PageLoadError
        title={t("confirmError")}
        description={tRoot(getErrorKey(error))}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {t("confirmTitle")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("confirmHint")}</p>
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
