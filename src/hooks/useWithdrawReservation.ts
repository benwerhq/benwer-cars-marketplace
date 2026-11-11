"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi } from "@/services/api";
import { QueryKeys } from "@/enums";
import { logError } from "@/lib/logger";

export function useWithdrawReservation(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reservationsApi.withdraw(token),
    onSuccess: (reservation) => {
      queryClient.setQueryData([QueryKeys.RESERVATION, token], reservation);
    },
    onError: (error) => {
      logError(error, { context: "reservation_withdraw", token });
    },
  });
}
