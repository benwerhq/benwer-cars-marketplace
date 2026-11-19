"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useOptionalGuestAuth } from "@/context/GuestAuthProvider";
import { QueryKeys } from "@/enums";
import {
  guestNotificationsQueryKey,
  guestNotificationsUnreadQueryKey,
} from "@/lib/queryKeys";
import { guestNotificationsApi } from "@/services/api/guestNotifications";

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

/**
 * Retained for backwards compatibility — the single app-wide guest SSE stream
 * is managed by `<RealtimeProvider>` in `src/app/layout.tsx`.
 */
export function useGuestNotificationStream(): void {
  // Managed centrally by RealtimeProvider to avoid duplicate SSE connections.
}
