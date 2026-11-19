"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useOptionalGuestAuth } from "@/context/GuestAuthProvider";
import {
  companySlugFromPathname,
  connectGuestRealtime,
  connectPublicRealtime,
  createInvalidationDebouncer,
  GUEST_INVALIDATION_DEBOUNCE_MS,
  HIDDEN_TAB_DISCONNECT_MS,
  invalidateForegroundQueries,
  PUBLIC_INVALIDATION_DEBOUNCE_MS,
  PUBLIC_INVALIDATION_JITTER_MS,
  queryKeysForGuestEvent,
  queryKeysForPublicEvent,
  type RealtimeConnection,
} from "@/lib/realtime";

interface RealtimeProviderProps {
  /** Custom-domain tenant slug from middleware (`x-company-slug`), if any. */
  hostCompanySlug?: string | null;
  children: ReactNode;
}

/**
 * Keeps TanStack Query caches synchronized across devices via direct API SSE:
 * - Public catalog/availability stream (`GET /v1/public/events`), scoped when on a company site.
 * - Authenticated guest stream (`GET /v1/public/guest/events`) when signed in.
 * Pauses streams after a hidden-tab grace period and refreshes active queries on return.
 */
export function RealtimeProvider({ hostCompanySlug, children }: RealtimeProviderProps) {
  const pathname = usePathname();
  const auth = useOptionalGuestAuth();
  const queryClient = useQueryClient();

  const isSignedIn = Boolean(auth?.ready && auth?.user?.uid);
  const companySlug = hostCompanySlug?.trim() || companySlugFromPathname(pathname);

  const publicConnRef = useRef<RealtimeConnection | null>(null);
  const guestConnRef = useRef<RealtimeConnection | null>(null);
  const hiddenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disconnectedForHiddenRef = useRef(false);

  useEffect(() => {
    const publicDebouncer = createInvalidationDebouncer(queryClient, {
      delayMs: PUBLIC_INVALIDATION_DEBOUNCE_MS,
      jitterMaxMs: PUBLIC_INVALIDATION_JITTER_MS,
    });
    const guestDebouncer = createInvalidationDebouncer(queryClient, {
      delayMs: GUEST_INVALIDATION_DEBOUNCE_MS,
    });

    const clearHiddenTimer = () => {
      if (hiddenTimerRef.current) {
        clearTimeout(hiddenTimerRef.current);
        hiddenTimerRef.current = null;
      }
    };

    const disconnectAll = () => {
      publicDebouncer.flush();
      guestDebouncer.flush();
      publicConnRef.current?.close();
      guestConnRef.current?.close();
      publicConnRef.current = null;
      guestConnRef.current = null;
    };

    const connectAll = () => {
      disconnectAll();
      publicConnRef.current = connectPublicRealtime({
        companySlug,
        onEvent(event) {
          publicDebouncer.enqueue(queryKeysForPublicEvent(event));
        },
      });
      if (isSignedIn) {
        guestConnRef.current = connectGuestRealtime({
          onEvent(event) {
            if (event.type === "notification.created" && event.title) {
              toast.info(event.title, { description: event.body });
            }
            guestDebouncer.enqueue(queryKeysForGuestEvent(event));
          },
        });
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearHiddenTimer();
        hiddenTimerRef.current = setTimeout(() => {
          disconnectedForHiddenRef.current = true;
          disconnectAll();
        }, HIDDEN_TAB_DISCONNECT_MS);
        return;
      }

      clearHiddenTimer();
      if (disconnectedForHiddenRef.current) {
        disconnectedForHiddenRef.current = false;
        invalidateForegroundQueries(queryClient, isSignedIn);
        connectAll();
      }
    };

    if (typeof document === "undefined" || document.visibilityState !== "hidden") {
      connectAll();
    } else {
      disconnectedForHiddenRef.current = true;
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearHiddenTimer();
      disconnectAll();
      publicDebouncer.clear();
      guestDebouncer.clear();
    };
  }, [companySlug, isSignedIn, queryClient]);

  return children;
}
