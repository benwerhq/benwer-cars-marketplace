"use client";

import { useEffect } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { useOptionalGuestAuth } from "@/context/GuestAuthProvider";
import { QueryKeys } from "@/enums";
import { getGuestAccessToken } from "@/lib/guestAccessToken";
import { joinApiUrl } from "@/lib/publicApiProxy";
import {
  guestNotificationsQueryKey,
  guestNotificationsUnreadQueryKey,
} from "@/lib/queryKeys";
import { liveApiBaseUrl } from "@/services/api/client";
import { guestNotificationsApi } from "@/services/api/guestNotifications";
import type { GuestNotification } from "@/types/guestNotifications";

export function useGuestNotifications(enabled = true) {
  const auth = useOptionalGuestAuth();
  const locale = useLocale();
  const uid = auth?.user?.uid ?? null;
  const active = Boolean(enabled && auth?.ready && uid);

  return useInfiniteQuery({
    queryKey: guestNotificationsQueryKey(uid, locale),
    queryFn: ({ pageParam }) =>
      guestNotificationsApi.list(pageParam as string | undefined, locale),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: active,
  });
}

export function useUnreadGuestNotificationCount() {
  const auth = useOptionalGuestAuth();
  const uid = auth?.user?.uid ?? null;
  const active = Boolean(auth?.ready && uid);

  return useQuery({
    queryKey: guestNotificationsUnreadQueryKey(uid),
    queryFn: () => guestNotificationsApi.unreadCount(),
    enabled: active,
    staleTime: 30_000,
  });
}

export function useMarkGuestNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guestNotificationsApi.markRead(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QueryKeys.GUEST_NOTIFICATIONS] }),
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.GUEST_NOTIFICATIONS_UNREAD],
        }),
      ]);
    },
  });
}

export function useMarkAllGuestNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => guestNotificationsApi.markAllRead(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QueryKeys.GUEST_NOTIFICATIONS] }),
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.GUEST_NOTIFICATIONS_UNREAD],
        }),
      ]);
    },
  });
}

export function useDismissGuestNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guestNotificationsApi.dismiss(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QueryKeys.GUEST_NOTIFICATIONS] }),
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.GUEST_NOTIFICATIONS_UNREAD],
        }),
      ]);
    },
  });
}

interface StreamNotificationPayload {
  id?: string;
  title?: string;
  body?: string;
  type?: GuestNotification["type"];
}

export function useGuestNotificationStream() {
  const auth = useOptionalGuestAuth();
  const queryClient = useQueryClient();
  const uid = auth?.user?.uid ?? null;
  const active = Boolean(auth?.ready && uid);

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;
    let controller: AbortController | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryDelayMs = 2_000;

    const handlePayload = (raw: string) => {
      try {
        const payload = JSON.parse(raw) as StreamNotificationPayload;
        if (payload.title) {
          toast.info(payload.title, {
            description: payload.body,
          });
        }
      } catch {
        // Ignore malformed event payloads
      }
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.GUEST_NOTIFICATIONS] });
      void queryClient.invalidateQueries({
        queryKey: [QueryKeys.GUEST_NOTIFICATIONS_UNREAD],
      });
      void queryClient.invalidateQueries({ queryKey: [QueryKeys.GUEST_RESERVATIONS] });
    };

    const connect = async () => {
      if (cancelled) {
        return;
      }

      const token = await getGuestAccessToken();
      if (!token || cancelled) {
        return;
      }

      const base = liveApiBaseUrl();
      if (!base) {
        return;
      }

      controller = new AbortController();
      try {
        const response = await fetch(joinApiUrl(base, "/v1/public/guest/events"), {
          headers: {
            Accept: "text/event-stream",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`SSE HTTP ${response.status}`);
        }

        retryDelayMs = 2_000;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) {
            const dataLines = frame
              .split("\n")
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trim());
            if (dataLines.length > 0) {
              handlePayload(dataLines.join("\n"));
            }
          }
        }
      } catch {
        // Reconnect on transient stream drops unless cancelled
      }

      if (!cancelled) {
        retryTimer = setTimeout(() => {
          retryDelayMs = Math.min(retryDelayMs * 2, 30_000);
          void connect();
        }, retryDelayMs);
      }
    };

    void connect();

    return () => {
      cancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      controller?.abort();
    };
  }, [active, queryClient]);
}
