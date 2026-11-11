"use client";

import { useQuery } from "@tanstack/react-query";
import { reservationsApi } from "@/services/api";
import {
  isPaymentSettled,
  isReservationTerminal,
  needsOnlinePayment,
} from "@/lib/guestPayment";
import { reservationQueryKey } from "@/lib/queryKeys";

const POLL_MS = 2000;

export function useReservation(
  token: string,
  options?: { poll?: boolean },
) {
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
