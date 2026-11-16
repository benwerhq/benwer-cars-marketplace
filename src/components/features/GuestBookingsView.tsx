"use client";

import { useState, type FormEvent } from "react";
import { Inbox, Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { GuestReservation } from "@/types/reservation";
import { GuestDisabledState } from "@/components/features/GuestDisabledState";
import { GuestBookingCard } from "./GuestBookingCard";
import { GuestVerifyEmailNotice } from "./GuestVerifyEmailNotice";
import { GuestSignInPanel } from "@/components/features/GuestSignInPanel";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PageLoadError } from "@/components/ui/PageLoadError";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGuestAuth } from "@/context/GuestAuthProvider";
import { ReservationStatus } from "@/enums";
import { startOfToday, toIsoDate } from "@/lib/dates";
import { isGuestNotConfiguredError } from "@/lib/guestAccount";
import { getErrorKey } from "@/lib/errors";
import { siteBookingPath } from "@/lib/site";
import {
  useGuestAccount,
  useGuestLink,
  useGuestReservations,
} from "@/hooks/useGuestAccount";
import { useReturnAfterSignIn } from "@/hooks/useReturnAfterSignIn";

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
  const { user, ready, configured, emailVerified } = useGuestAuth();
  const returning = useReturnAfterSignIn(Boolean(user));
  const account = useGuestAccount(companySlug);
  const reservations = useGuestReservations(companySlug);
  const link = useGuestLink(companySlug);
  const [email, setEmail] = useState("");
  const [bookingToken, setBookingToken] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  if (!ready || returning) {
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

  if (!emailVerified) {
    return <GuestVerifyEmailNotice companySlug={companySlug} />;
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
        <div className="flex flex-col gap-8">
          {splitBookings(reservations.data).map((group) =>
            group.items.length ? (
              <section key={group.key} className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  {t(group.key)}{" "}
                  <span className="font-normal">({group.items.length})</span>
                </h2>
                <ul className="flex flex-col gap-4">
                  {group.items.map((item) => (
                    <li key={item.id || item.token}>
                      <GuestBookingCard
                        reservation={item}
                        companySlug={companySlug}
                        href={siteBookingPath(slug, item.token || item.id)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null,
          )}
        </div>
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

const FINISHED_STATUSES: ReadonlySet<ReservationStatus> = new Set([
  ReservationStatus.COMPLETED,
  ReservationStatus.CANCELLED,
]);

function splitBookings(items: GuestReservation[]) {
  const today = toIsoDate(startOfToday());
  const isPast = (item: GuestReservation) =>
    FINISHED_STATUSES.has(item.status) || item.endDate < today;
  const upcoming = items
    .filter((item) => !isPast(item))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = items
    .filter(isPast)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  return [
    { key: "bookingsUpcoming" as const, items: upcoming },
    { key: "bookingsPast" as const, items: past },
  ];
}
