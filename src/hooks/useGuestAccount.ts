"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGuestAuth } from "@/context/GuestAuthProvider";
import { logError } from "@/lib/logger";
import {
  guestAccountQueryKey,
  guestReservationsQueryKey,
} from "@/lib/queryKeys";
import { guestApi } from "@/services/api/guest";
import type { GuestLinkPayload } from "@/types/guest";

export function useGuestAccount(companySlug: string) {
  const { user, ready, configured } = useGuestAuth();

  return useQuery({
    queryKey: guestAccountQueryKey(companySlug),
    queryFn: () => guestApi.me(companySlug),
    enabled: ready && configured && Boolean(user) && Boolean(companySlug),
    retry: false,
  });
}

export function useGuestReservations(companySlug: string) {
  const { user, ready, configured } = useGuestAuth();

  return useQuery({
    queryKey: guestReservationsQueryKey(companySlug),
    queryFn: () => guestApi.listReservations(companySlug),
    enabled: ready && configured && Boolean(user) && Boolean(companySlug),
    retry: false,
  });
}

export function useGuestLink(companySlug: string) {
  return useMutation({
    mutationFn: (payload: GuestLinkPayload) =>
      guestApi.requestLink(companySlug, payload),
    onError: (error) => {
      logError(error, { context: "guest_link", companySlug });
    },
  });
}

export function useConfirmGuestLink(companySlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => guestApi.confirmLink(companySlug, token),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: guestAccountQueryKey(companySlug),
      });
      await queryClient.invalidateQueries({
        queryKey: guestReservationsQueryKey(companySlug),
      });
    },
    onError: (error) => {
      logError(error, { context: "guest_link_confirm", companySlug });
    },
  });
}

export function useUnlinkGuest(companySlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => guestApi.unlink(companySlug),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: guestAccountQueryKey(companySlug),
      });
      await queryClient.invalidateQueries({
        queryKey: guestReservationsQueryKey(companySlug),
      });
    },
    onError: (error) => {
      logError(error, { context: "guest_unlink", companySlug });
    },
  });
}

export function useEraseGuest(companySlug: string) {
  const { signOut } = useGuestAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => guestApi.erase(companySlug),
    onSuccess: async () => {
      await queryClient.removeQueries({
        queryKey: guestAccountQueryKey(companySlug),
      });
      await queryClient.removeQueries({
        queryKey: guestReservationsQueryKey(companySlug),
      });
      await signOut();
    },
    onError: (error) => {
      logError(error, { context: "guest_erase", companySlug });
    },
  });
}
