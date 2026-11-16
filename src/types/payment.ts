import type { CaptureMethod, PaymentChannel, PaymentStatus } from "@/enums";

export interface GuestPayment {
  reservationId: string;
  status: PaymentStatus;
  channel: PaymentChannel | null;
  captureMethod: CaptureMethod | null;
  required: boolean;
  authorized: boolean;
  amount: number;
  paidAmount: number;
  currency: string;
  checkoutUrl: string | null;
  clientSecret: string | null;
  publishableKey: string | null;
  connectedAccountId: string | null;
  expiresAt: string | null;
}

export interface CreateGuestPaymentPayload {
  successUrl?: string;
  cancelUrl?: string;
}

export interface GuestCancellationQuote {
  canOverride: false;
  canCancel: boolean;
  fee: number;
  refund: number;
  chargeAmount: number;
  currency: string;
}
