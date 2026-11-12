import {
  CaptureMethod,
  PaymentChannel,
  PaymentStatus,
  ReservationStatus,
} from "@/enums";
import type { GuestPayment } from "@/types/payment";
import type { GuestReservation } from "@/types/reservation";

export function isPaymentSettled(
  payment?: GuestPayment | null,
  reservation?: GuestReservation | null,
): boolean {
  if (payment?.authorized) {
    return true;
  }

  if (
    payment?.status === PaymentStatus.PAID ||
    payment?.status === PaymentStatus.PARTIALLY_PAID
  ) {
    return true;
  }

  if (reservation?.advanceAuthorized) {
    return true;
  }

  return (
    reservation?.paymentStatus === PaymentStatus.PAID ||
    reservation?.paymentStatus === PaymentStatus.PARTIALLY_PAID
  );
}

export function isReservationTerminal(reservation: GuestReservation): boolean {
  return (
    reservation.status === ReservationStatus.CANCELLED ||
    reservation.status === ReservationStatus.COMPLETED
  );
}

export function isPaymentWindowOpen(
  expiresAt: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!expiresAt) {
    return true;
  }

  const expires = Date.parse(expiresAt);
  if (Number.isNaN(expires)) {
    return true;
  }

  return expires > now;
}

export function remainingPaymentMs(
  expiresAt: string | null | undefined,
  now = Date.now(),
): number {
  if (!expiresAt) {
    return 0;
  }

  const expires = Date.parse(expiresAt);
  if (Number.isNaN(expires)) {
    return 0;
  }

  return Math.max(0, expires - now);
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function needsOnlinePayment(reservation: GuestReservation): boolean {
  if (isReservationTerminal(reservation) || isPaymentSettled(null, reservation)) {
    return false;
  }

  // advanceDue is computed from the company's settings for every booking,
  // even ones confirmed without online payment (no Stripe account, payments
  // feature off). Only website-channel bookings can be paid online.
  return (
    reservation.onlinePaymentRequired ||
    (reservation.advanceDue > 0 &&
      reservation.paymentChannel === PaymentChannel.WEBSITE)
  );
}

export function canStartGuestPayment(reservation: GuestReservation): boolean {
  if (!needsOnlinePayment(reservation)) {
    return false;
  }

  return isPaymentWindowOpen(reservation.paymentExpiresAt);
}

export function canWithdrawReservation(reservation: GuestReservation): boolean {
  return reservation.status === ReservationStatus.DRAFT;
}

export function canSelfServeCancel(reservation: GuestReservation): boolean {
  return reservation.status === ReservationStatus.CONFIRMED;
}

export function isManualCapture(payment: GuestPayment | null): boolean {
  return payment?.captureMethod === CaptureMethod.MANUAL;
}

export function stripeRedirectPending(search = ""): boolean {
  const query = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(query);
  const status = params.get("redirect_status");
  if (status === "failed") {
    return false;
  }

  return params.has("payment_intent") || params.has("redirect_status");
}
