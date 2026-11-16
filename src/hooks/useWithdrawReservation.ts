"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi } from "@/services/api";
import { logError } from "@/lib/logger";
import { reservationQueryKey } from "@/lib/queryKeys";

export function useWithdrawReservation(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reservationsApi.withdraw(token),
    onSuccess: (reservation) => {
      queryClient.setQueryData(reservationQueryKey(token), reservation);
    },
    onError: (error) => {
      logError(error, { context: "reservation_withdraw", token });
    },
  });
}
