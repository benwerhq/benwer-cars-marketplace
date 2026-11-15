"use client";

import * as Popover from "@radix-ui/react-popover";
import { Bell, BellOff, BellRing, CheckCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useOptionalGuestAuth } from "@/context/GuestAuthProvider";
import { GuestNotificationStatus } from "@/enums";
import {
  useDismissGuestNotification,
  useGuestNotifications,
  useGuestNotificationStream,
  useMarkAllGuestNotificationsRead,
  useMarkGuestNotificationRead,
  useUnreadGuestNotificationCount,
} from "@/hooks/useGuestNotifications";
import {
  canUseGuestWebPush,
  disableGuestWebPush,
  enableGuestWebPush,
  getActiveGuestPushSubscription,
  getWebPushPermission,
} from "@/lib/guestWebPush";
import type { GuestNotification } from "@/types/guestNotifications";

interface GuestNotificationBellProps {
  siteSlug?: string;
}

function buildNotificationHref(
  item: GuestNotification,
  siteSlug?: string,
): string | null {
  if (!item.bookingToken) {
    return null;
  }
  const slug = siteSlug ?? item.company?.slug;
  if (slug) {
    return `/s/${slug}/booking/${item.bookingToken}`;
  }
  return `/booking/${item.bookingToken}`;
}

export function GuestNotificationBell({ siteSlug }: GuestNotificationBellProps) {
  const auth = useOptionalGuestAuth();
  const isSignedIn = Boolean(auth?.ready && auth.user);

  useGuestNotificationStream();

  if (!isSignedIn) {
    return null;
  }

  return <GuestNotificationBellInner siteSlug={siteSlug} />;
}

function GuestNotificationBellInner({ siteSlug }: GuestNotificationBellProps) {
  const t = useTranslations("guestNotifications");
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  const unreadQuery = useUnreadGuestNotificationCount();
  const listQuery = useGuestNotifications(open);
  const markRead = useMarkGuestNotificationRead();
  const markAllRead = useMarkAllGuestNotificationsRead();
  const dismiss = useDismissGuestNotification();

  useEffect(() => {
    if (!open || !canUseGuestWebPush()) {
      return;
    }
    let active = true;
    void getActiveGuestPushSubscription().then((sub) => {
      if (!active) {
        return;
      }
      setPushSupported(true);
      setPushPermission(getWebPushPermission());
      setPushSubscribed(Boolean(sub));
    });
    return () => {
      active = false;
    };
  }, [open]);

  const unreadCount = unreadQuery.data?.unreadCount ?? 0;
  const items = listQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const handleTogglePush = async () => {
    setPushBusy(true);
    try {
      if (pushSubscribed) {
        await disableGuestWebPush();
        setPushSubscribed(false);
      } else {
        const result = await enableGuestWebPush(locale);
        setPushPermission(getWebPushPermission());
        setPushSubscribed(result === "enabled");
      }
    } finally {
      setPushBusy(false);
    }
  };

  const handleSelectItem = (item: GuestNotification) => {
    if (item.status === GuestNotificationStatus.UNREAD) {
      markRead.mutate(item.id);
    }
    const href = buildNotificationHref(item, siteSlug);
    if (href) {
      setOpen(false);
      router.push(href);
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(iso));
    } catch {
      return "";
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0
              ? t("unreadCount", { count: unreadCount })
              : t("openLabel")
          }
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-background text-foreground shadow-lg sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">{t("title")}</h2>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {t("markAllRead")}
              </button>
            ) : null}
          </div>

          {pushSupported ? (
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2 text-xs">
              {pushPermission === "denied" ? (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <BellOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {t("pushBlocked")}
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <BellRing className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {pushSubscribed ? t("pushEnabled") : t("enablePush")}
                  </span>
                  <button
                    type="button"
                    disabled={pushBusy}
                    onClick={() => void handleTogglePush()}
                    className="font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    {pushSubscribed ? t("disablePush") : t("enablePush")}
                  </button>
                </>
              )}
            </div>
          ) : null}

          <div className="max-h-96 overflow-y-auto">
            {listQuery.isLoading ? (
              <div className="space-y-3 p-4">
                <div className="h-12 animate-pulse rounded bg-muted" />
                <div className="h-12 animate-pulse rounded bg-muted" />
              </div>
            ) : listQuery.isError ? (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <p className="text-sm text-muted-foreground">{t("error")}</p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void listQuery.refetch()}
                >
                  {t("retry")}
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm font-medium">{t("emptyTitle")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("emptyBody")}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => {
                  const isUnread =
                    item.status === GuestNotificationStatus.UNREAD;
                  return (
                    <li
                      key={item.id}
                      className={`group relative flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-accent/50 ${
                        isUnread ? "bg-accent/25" : ""
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          isUnread ? "bg-primary" : "bg-transparent"
                        }`}
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="text-sm font-medium leading-snug">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.body}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {item.company ? `${item.company.name} · ` : ""}
                          {formatTimestamp(item.createdAt)}
                        </p>
                      </button>
                      <button
                        type="button"
                        aria-label={t("dismiss")}
                        onClick={(e) => {
                          e.stopPropagation();
                          dismiss.mutate(item.id);
                        }}
                        className="shrink-0 rounded p-1 text-muted-foreground opacity-70 hover:bg-muted hover:text-foreground hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {listQuery.hasNextPage ? (
              <div className="border-t border-border p-2 text-center">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={listQuery.isFetchingNextPage}
                  onClick={() => void listQuery.fetchNextPage()}
                >
                  {t("loadMore")}
                </Button>
              </div>
            ) : null}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
