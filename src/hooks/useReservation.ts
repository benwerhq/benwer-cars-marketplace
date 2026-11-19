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
  const query = useQuery({
    queryKey: reservationQueryKey(token),
    queryFn: () => reservationsApi.getByToken(token),
    enabled: Boolean(token),
    refetchInterval: (current) => {
      if (!options?.poll) {
        return false;
      }

      const reservation = current.state.data;
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
  // Open the live stream only for a booking that exists: a bad link must not keep retrying.
  const found = Boolean(query.data);

  useEffect(() => {
    const normalized = token.trim();
    if (!normalized || !found) {
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
  }, [token, found, queryClient]);

  return query;
}
