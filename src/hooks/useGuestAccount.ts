"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGuestAuth, useOptionalGuestAuth } from "@/context/GuestAuthProvider";
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

/**
 * The signed-in guest for prefilling a booking, on pages that may or may not
 * have guest auth. Email comes from Firebase; name and phone from the
 * company's linked customer record.
 */
export function useGuestPrefill(companySlug: string) {
  const auth = useOptionalGuestAuth();
  const user = auth?.ready && auth.configured ? auth.user : null;
  const account = useQuery({
    queryKey: guestAccountQueryKey(companySlug),
    queryFn: () => guestApi.me(companySlug),
    enabled: Boolean(user) && Boolean(companySlug),
    retry: false,
  });
  const customer = user ? (account.data?.customer ?? null) : null;

  return {
    available: Boolean(auth?.configured),
    ready: auth ? auth.ready : true,
    email: user?.email ?? "",
    fullName: customer?.fullName || user?.displayName || "",
    phone: customer?.phone || "",
    dateOfBirth: customer?.dateOfBirth || "",
    signedIn: Boolean(user),
  };
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
