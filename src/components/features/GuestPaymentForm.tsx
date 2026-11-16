"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { loadConnectedStripe, stripeAppearance } from "@/lib/stripeConnect";
import type { GuestPayment } from "@/types/payment";

interface GuestPaymentFormProps {
  payment: GuestPayment;
  returnUrl: string;
  guestEmail?: string;
  guestName?: string;
  payLabel: string;
  payingLabel: string;
  onSubmitted: () => void;
  onError: (message: string) => void;
}

export function GuestPaymentForm({
  payment,
  returnUrl,
  guestEmail,
  guestName,
  payLabel,
  payingLabel,
  onSubmitted,
  onError,
}: GuestPaymentFormProps) {
  const clientSecret = payment.clientSecret;
  const publishableKey = payment.publishableKey;
  const connectedAccountId = payment.connectedAccountId;

  const stripePromise = useMemo(() => {
    if (!publishableKey || !connectedAccountId) {
      return null;
    }

    return loadConnectedStripe(publishableKey, connectedAccountId);
  }, [connectedAccountId, publishableKey]);

  if (!clientSecret || !stripePromise) {
    return <ErrorState />;
  }

  return (
    <Elements
      key={clientSecret}
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: stripeAppearance(),
      }}
    >
      <PaymentElementFields
        returnUrl={returnUrl}
        guestEmail={guestEmail}
        guestName={guestName}
        payLabel={payLabel}
        payingLabel={payingLabel}
        onSubmitted={onSubmitted}
        onError={onError}
      />
    </Elements>
  );
}

function PaymentElementFields({
  returnUrl,
  guestEmail,
  guestName,
  payLabel,
  payingLabel,
  onSubmitted,
  onError,
}: Omit<GuestPaymentFormProps, "payment">) {
  const t = useTranslations("payment");
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const submit = await elements.submit();
      if (submit.error) {
        onError(submit.error.message ?? t("declined"));
        return;
      }

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          ...(guestEmail || guestName
            ? {
                payment_method_data: {
                  billing_details: {
                    email: guestEmail,
                    name: guestName,
                  },
                },
              }
            : {}),
        },
        redirect: "if_required",
      });

      if (result.error) {
        onError(result.error.message ?? t("declined"));
        return;
      }

      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      <Button
        type="submit"
        size="lg"
        className="h-11 w-full"
        isLoading={submitting}
        disabled={!stripe || !elements || submitting}
      >
        {submitting ? payingLabel : payLabel}
      </Button>
    </form>
  );
}
