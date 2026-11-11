"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { guestPaymentsApi } from "@/services/api";
import { logError } from "@/lib/logger";
import {
  cancellationQuoteQueryKey,
  guestPaymentQueryKey,
  reservationQueryKey,
} from "@/lib/queryKeys";
import { isPaymentSettled, isPaymentWindowOpen } from "@/lib/guestPayment";
import type { CreateGuestPaymentPayload } from "@/types/payment";

const POLL_MS = 2000;

export function useGuestPayment(
  token: string,
  options?: { enabled?: boolean; poll?: boolean },
) {
  return useQuery({
    queryKey: guestPaymentQueryKey(token),
    queryFn: () => guestPaymentsApi.get(token),
    enabled: Boolean(token) && (options?.enabled ?? true),
    refetchInterval: (query) => {
      if (!options?.poll) {
        return false;
      }

      const payment = query.state.data;
      if (!payment || isPaymentSettled(payment)) {
        return false;
      }

      if (payment.expiresAt && !isPaymentWindowOpen(payment.expiresAt)) {
        return false;
      }

      return POLL_MS;
    },
  });
}

export function useCreateGuestPayment(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGuestPaymentPayload) =>
      guestPaymentsApi.create(token, payload),
    onSuccess: (payment) => {
      queryClient.setQueryData(guestPaymentQueryKey(token), payment);
    },
    onError: (error) => {
      logError(error, { context: "guest_payment_create", token });
    },
  });
}

export function useCancellationQuote(
  token: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: cancellationQuoteQueryKey(token),
    queryFn: () => guestPaymentsApi.cancellationQuote(token),
    enabled: Boolean(token) && (options?.enabled ?? false),
  });
}

export function useCancelReservation(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => guestPaymentsApi.cancel(token),
    onSuccess: (reservation) => {
      queryClient.setQueryData(reservationQueryKey(token), reservation);
      void queryClient.invalidateQueries({
        queryKey: guestPaymentQueryKey(token),
      });
    },
    onError: (error) => {
      logError(error, { context: "guest_reservation_cancel", token });
    },
  });
}
