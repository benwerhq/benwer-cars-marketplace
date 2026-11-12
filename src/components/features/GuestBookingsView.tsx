"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Inbox, Link2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { GuestDisabledState } from "@/components/features/GuestDisabledState";
import { GuestSignInPanel } from "@/components/features/GuestSignInPanel";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PageLoadError } from "@/components/ui/PageLoadError";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGuestAuth } from "@/context/GuestAuthProvider";
import { formatLongDate, parseIsoDate } from "@/lib/dates";
import { isGuestNotConfiguredError } from "@/lib/guestAccount";
import { getErrorKey } from "@/lib/errors";
import { formatMoney } from "@/lib/money";
import { siteBookingPath } from "@/lib/site";
import {
  useGuestAccount,
  useGuestLink,
  useGuestReservations,
} from "@/hooks/useGuestAccount";

interface GuestBookingsViewProps {
  slug: string;
  companySlug: string;
  companyName: string;
}

export function GuestBookingsView({
  slug,
  companySlug,
  companyName,
}: GuestBookingsViewProps) {
  const t = useTranslations("guest");
  const tRoot = useTranslations();
  const tStatus = useTranslations("reservationStatus");
  const locale = useLocale();
  const { user, ready, configured } = useGuestAuth();
  const account = useGuestAccount(companySlug);
  const reservations = useGuestReservations(companySlug);
  const link = useGuestLink(companySlug);
  const [email, setEmail] = useState("");
  const [bookingToken, setBookingToken] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  if (!ready) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (
    !configured ||
    isGuestNotConfiguredError(account.error) ||
    isGuestNotConfiguredError(reservations.error)
  ) {
    return <GuestDisabledState />;
  }

  if (!user) {
    return <GuestSignInPanel />;
  }

  const listError =
    reservations.error && !isGuestNotConfiguredError(reservations.error)
      ? reservations.error
      : null;

  async function onLink(event: FormEvent) {
    event.preventDefault();
    await link.mutateAsync({
      email: email.trim() || undefined,
      bookingToken: bookingToken.trim() || undefined,
    });
    setEmail("");
    setBookingToken("");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {t("bookingsTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("bookingsHint", {
              company: companyName,
              email: user.email ?? "",
            })}
          </p>
        </div>
        {linkOpen || !reservations.data?.length ? null : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setLinkOpen(true)}
          >
            <Link2 size={16} aria-hidden />
            {t("linkTitle")}
          </Button>
        )}
      </div>

      {reservations.isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : listError ? (
        <PageLoadError
          title={t("loadErrorTitle")}
          description={tRoot(getErrorKey(listError))}
        />
      ) : !reservations.data?.length ? (
        <EmptyState
          icon={<Inbox size={28} />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          actionLabel={linkOpen ? undefined : t("linkTitle")}
          onAction={() => setLinkOpen(true)}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {reservations.data.map((item) => {
            const start = parseIsoDate(item.startDate);
            const href = siteBookingPath(slug, item.token || item.id);
            return (
              <li key={item.id || item.token}>
                <Link
                  href={href}
                  className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-primary/40"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {item.vehicle
                      ? `${item.vehicle.brand} ${item.vehicle.model}`
                      : t("bookingFallback")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {start ? formatLongDate(start, locale) : item.startDate} ·{" "}
                    {formatMoney(item.totalPrice, item.currency, locale)} ·{" "}
                    {tStatus(`status.${item.status}`)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {linkOpen ? (
        <form
          onSubmit={onLink}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5"
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {t("linkTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("linkHint")}
            </p>
          </div>
          <Field label={t("linkEmail")} htmlFor="guest-link-email">
            <Input
              id="guest-link-email"
              type="email"
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field label={t("linkToken")} htmlFor="guest-link-token">
            <Input
              id="guest-link-token"
              value={bookingToken}
              onChange={(event) => setBookingToken(event.target.value)}
            />
          </Field>
          {link.isSuccess ? (
            <p className="text-sm text-muted-foreground">{t("linkSent")}</p>
          ) : null}
          {link.isError ? (
            <p className="text-sm text-danger" role="alert">
              {tRoot(getErrorKey(link.error))}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              isLoading={link.isPending}
              disabled={!email.trim() && !bookingToken.trim()}
            >
              {t("linkAction")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLinkOpen(false)}
            >
              {t("linkCancel")}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
