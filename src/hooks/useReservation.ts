"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/enums";
import { reservationsApi } from "@/services/api";
import {
  isPaymentSettled,
  isReservationTerminal,
  needsOnlinePayment,
} from "@/lib/guestPayment";
import { reservationQueryKey } from "@/lib/queryKeys";
import {
  connectTokenReservationRealtime,
  createInvalidationDebouncer,
  GUEST_INVALIDATION_DEBOUNCE_MS,
} from "@/lib/realtime";

const POLL_MS = 2000;

export function useReservation(
  token: string,
  options?: { poll?: boolean },
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const normalized = token.trim();
    if (!normalized) {
      return;
    }
    const debouncer = createInvalidationDebouncer(queryClient, {
      delayMs: GUEST_INVALIDATION_DEBOUNCE_MS,
    });
    const connection = connectTokenReservationRealtime({
      token: normalized,
      onEvent() {
        debouncer.enqueue([
          QueryKeys.RESERVATION,
          QueryKeys.PAYMENT,
          QueryKeys.CANCELLATION_QUOTE,
        ]);
      },
    });
    return () => {
      connection.close();
      debouncer.clear();
    };
  }, [token, queryClient]);

  return useQuery({
    queryKey: reservationQueryKey(token),
    queryFn: () => reservationsApi.getByToken(token),
    enabled: Boolean(token),
    refetchInterval: (query) => {
      if (!options?.poll) {
        return false;
      }

      const reservation = query.state.data;
      if (
        !reservation ||
        isReservationTerminal(reservation) ||
        isPaymentSettled(null, reservation) ||
        !needsOnlinePayment(reservation)
      ) {
        return false;
      }

      return POLL_MS;
    },
  });
}
