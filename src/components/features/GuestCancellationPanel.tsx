"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useCancelReservation,
  useCancellationQuote,
} from "@/hooks/useGuestPayment";
import { getErrorKey } from "@/lib/errors";
import { formatMoney } from "@/lib/money";

interface GuestCancellationPanelProps {
  token: string;
}

export function GuestCancellationPanel({ token }: GuestCancellationPanelProps) {
  const t = useTranslations("payment");
  const tRoot = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const quote = useCancellationQuote(token, { enabled: open });
  const cancel = useCancelReservation(token);

  async function confirmCancel() {
    try {
      await cancel.mutateAsync();
      toast.success(t("cancelled"));
      setOpen(false);
    } catch (error) {
      toast.error(tRoot(getErrorKey(error)));
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {!open ? (
        <Button variant="danger" onClick={() => setOpen(true)}>
          {t("cancelBooking")}
        </Button>
      ) : null}

      {open ? (
        <div className="w-full rounded-2xl border border-border bg-surface p-5 text-left">
          <h2 className="text-sm font-semibold text-foreground">
            {t("cancelTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("cancelDescription")}
          </p>

          {quote.isPending ? (
            <div className="mt-4 flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          ) : null}

          {quote.isError ? (
            <ErrorState
              message={tRoot(getErrorKey(quote.error))}
              onRetry={() => void quote.refetch()}
            />
          ) : null}

          {quote.data ? (
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">{t("cancelFee")}</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">
                  {formatMoney(quote.data.fee, quote.data.currency, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t("cancelRefund")}
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">
                  {formatMoney(quote.data.refund, quote.data.currency, locale)}
                </dd>
              </div>
            </dl>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="danger"
              isLoading={cancel.isPending}
              disabled={
                quote.isPending ||
                Boolean(quote.error) ||
                quote.data?.canCancel === false
              }
              onClick={() => void confirmCancel()}
            >
              {t("confirmCancel")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={cancel.isPending}
            >
              {t("keepBooking")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
