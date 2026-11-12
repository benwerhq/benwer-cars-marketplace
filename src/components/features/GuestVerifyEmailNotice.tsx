"use client";

import { MailCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useGuestAuth } from "@/context/GuestAuthProvider";
import {
  useRefreshGuestVerification,
  useSendGuestVerification,
} from "@/hooks/useGuestAccount";
import { getErrorKey } from "@/lib/errors";

export function GuestVerifyEmailNotice({
  companySlug,
}: {
  companySlug: string;
}) {
  const t = useTranslations("guest");
  const tRoot = useTranslations();
  const locale = useLocale();
  const { user, emailVerified } = useGuestAuth();
  const send = useSendGuestVerification();
  const refresh = useRefreshGuestVerification(companySlug);

  if (!user || emailVerified) {
    return null;
  }

  const error = send.error ?? refresh.error;

  return (
    <section
      role="status"
      className="flex flex-col gap-4 rounded-2xl border border-warning/40 bg-warning-soft p-5 sm:flex-row sm:items-start"
    >
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-warning">
        <MailCheck size={20} aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t("verifyTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("verifyHint", { email: user.email ?? "" })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            isLoading={refresh.isPending}
            onClick={() => refresh.mutate()}
          >
            {t("verifyDone")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            isLoading={send.isPending}
            onClick={() => send.mutate(locale)}
          >
            {t("verifyResend")}
          </Button>
        </div>
        {send.isSuccess ? (
          <p className="text-sm text-muted-foreground">{t("verifySent")}</p>
        ) : null}
        {refresh.isSuccess && !refresh.data ? (
          <p className="text-sm text-muted-foreground">
            {t("verifyStillPending")}
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {tRoot(getErrorKey(error))}
          </p>
        ) : null}
      </div>
    </section>
  );
}
