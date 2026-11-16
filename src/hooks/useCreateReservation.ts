"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi } from "@/services/api";
import { logError } from "@/lib/logger";
import {
  guestAccountQueryKey,
  guestReservationsQueryKey,
} from "@/lib/queryKeys";
import type {
  CreateGuestReservationPayload,
  GuestReservation,
} from "@/types/reservation";

interface UseCreateReservationOptions {
  companySlug: string;
  onSuccess?: (reservation: GuestReservation) => void;
}

export function useCreateReservation({
  companySlug,
  onSuccess,
}: UseCreateReservationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGuestReservationPayload) =>
      reservationsApi.create(companySlug, payload),
    onSuccess: (reservation) => {
      void queryClient.invalidateQueries({
        queryKey: guestReservationsQueryKey(companySlug),
      });
      void queryClient.invalidateQueries({
        queryKey: guestAccountQueryKey(companySlug),
      });
      onSuccess?.(reservation);
    },
    onError: (error) => {
      logError(error, { context: "reservation_create", companySlug });
    },
  });
}
