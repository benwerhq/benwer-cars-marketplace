"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Trash2, Unlink } from "lucide-react";
import { useTranslations } from "next-intl";
import { GuestDisabledState } from "@/components/features/GuestDisabledState";
import { GuestSignInPanel } from "@/components/features/GuestSignInPanel";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGuestAuth } from "@/context/GuestAuthProvider";
import { useEraseGuest, useUnlinkGuest } from "@/hooks/useGuestAccount";
import { getErrorKey } from "@/lib/errors";

interface GuestProfileViewProps {
  companySlug: string;
  companyName: string;
  homeHref: string;
}

export function GuestProfileView({
  companySlug,
  companyName,
  homeHref,
}: GuestProfileViewProps) {
  const t = useTranslations("guest");
  const tRoot = useTranslations();
  const router = useRouter();
  const { user, ready, configured, signOut } = useGuestAuth();
  const unlink = useUnlinkGuest(companySlug);
  const erase = useEraseGuest(companySlug);
  const [confirmErase, setConfirmErase] = useState(false);

  if (!ready) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!configured) {
    return <GuestDisabledState />;
  }

  if (!user) {
    return <GuestSignInPanel />;
  }

  const error = unlink.error ?? erase.error;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {t("profileTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("bookingsHint", { company: companyName, email: user.email ?? "" })}
        </p>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold text-foreground">{t("accountTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("accountHint")}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            isLoading={unlink.isPending}
            onClick={() => {
              void unlink.mutateAsync();
            }}
          >
            <Unlink size={16} aria-hidden />
            {t("unlink")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void signOut().then(() => router.push(homeHref));
            }}
          >
            <LogOut size={16} aria-hidden />
            {t("signOut")}
          </Button>
        </div>
        {unlink.isSuccess ? (
          <p className="text-sm text-muted-foreground" role="status">
            {t("unlinked")}
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-danger/30 bg-danger-soft/40 p-5">
        <h2 className="text-lg font-semibold text-foreground">{t("eraseTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("eraseHint")}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="danger"
            isLoading={erase.isPending}
            onClick={() => {
              if (!confirmErase) {
                setConfirmErase(true);
                return;
              }
              void erase.mutateAsync().then(() => router.push(homeHref));
            }}
          >
            <Trash2 size={16} aria-hidden />
            {confirmErase ? t("eraseConfirm") : t("erase")}
          </Button>
          {confirmErase ? (
            <Button type="button" variant="ghost" onClick={() => setConfirmErase(false)}>
              {t("linkCancel")}
            </Button>
          ) : null}
        </div>
      </section>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {tRoot(getErrorKey(error))}
        </p>
      ) : null}
    </div>
  );
}
