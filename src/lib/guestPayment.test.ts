import { describe, expect, it } from "vitest";
import {
  CaptureMethod,
  PaymentChannel,
  PaymentStatus,
  ReservationStatus,
} from "@/enums";
import type { GuestPayment } from "@/types/payment";
import type { GuestReservation } from "@/types/reservation";
import {
  canSelfServeCancel,
  canStartGuestPayment,
  canWithdrawReservation,
  formatCountdown,
  isManualCapture,
  isPaymentSettled,
  isPaymentWindowOpen,
  needsOnlinePayment,
  remainingPaymentMs,
  stripeRedirectPending,
} from "./guestPayment";

function reservation(
  overrides: Partial<GuestReservation> = {},
): GuestReservation {
  return {
    id: "res-1",
    token: "tok",
    status: ReservationStatus.DRAFT,
    vehicleId: "v1",
    startDate: "2026-12-01",
    endDate: "2026-12-04",
    totalPrice: 120,
    priceBreakdown: null,
    currency: "EUR",
    guestName: "Ada",
    guestEmail: "ada@example.com",
    guestPhone: "+34600000000",
    companySlug: "demo",
    createdAt: "2026-11-11T00:00:00Z",
    requestExpiresAt: null,
    cancelReason: null,
    paymentStatus: PaymentStatus.UNPAID,
    paymentChannel: PaymentChannel.WEBSITE,
    paidAmount: 0,
    advanceDue: 40,
    advanceAuthorized: false,
    paymentExpiresAt: "2026-11-11T16:15:00Z",
    onlinePaymentRequired: true,
    ...overrides,
  };
}

function payment(overrides: Partial<GuestPayment> = {}): GuestPayment {
  return {
    reservationId: "res-1",
    status: PaymentStatus.UNPAID,
    channel: PaymentChannel.WEBSITE,
    captureMethod: CaptureMethod.AUTOMATIC,
    required: true,
    authorized: false,
    amount: 40,
    paidAmount: 0,
    currency: "EUR",
    checkoutUrl: null,
    clientSecret: null,
    publishableKey: "pk_test_123",
    connectedAccountId: "acct_123",
    expiresAt: "2026-11-11T16:15:00Z",
    ...overrides,
  };
}

describe("guestPayment", () => {
  it("requires payment when onlinePaymentRequired or advanceDue", () => {
    expect(needsOnlinePayment(reservation())).toBe(true);
    expect(
      needsOnlinePayment(
        reservation({ onlinePaymentRequired: false, advanceDue: 0 }),
      ),
    ).toBe(false);
    expect(
      needsOnlinePayment(
        reservation({
          onlinePaymentRequired: false,
          advanceDue: 25,
        }),
      ),
    ).toBe(true);
  });

  it("treats webhook-confirmed paid or authorized states as settled", () => {
    expect(isPaymentSettled(payment({ authorized: true }))).toBe(true);
    expect(isPaymentSettled(payment({ status: PaymentStatus.PAID }))).toBe(true);
    expect(
      isPaymentSettled(null, reservation({ advanceAuthorized: true })),
    ).toBe(true);
    expect(isPaymentSettled(payment(), reservation())).toBe(false);
  });

  it("does not treat a Stripe redirect as confirmation", () => {
    expect(stripeRedirectPending("?payment_intent=pi_1&redirect_status=succeeded")).toBe(
      true,
    );
    expect(stripeRedirectPending("?redirect_status=failed")).toBe(false);
    expect(isPaymentSettled(payment(), reservation())).toBe(false);
  });

  it("closes the pay window after paymentExpiresAt", () => {
    const expiresAt = "2026-11-11T16:15:00.000Z";
    const openAt = Date.parse("2026-11-11T16:10:00.000Z");
    const closedAt = Date.parse("2026-11-11T16:15:00.000Z");
    expect(isPaymentWindowOpen(expiresAt, openAt)).toBe(true);
    expect(isPaymentWindowOpen(expiresAt, closedAt)).toBe(false);
    expect(
      canStartGuestPayment(
        reservation({ paymentExpiresAt: "2099-01-01T00:00:00.000Z" }),
      ),
    ).toBe(true);
    expect(
      canStartGuestPayment(
        reservation({ paymentExpiresAt: "2000-01-01T00:00:00.000Z" }),
      ),
    ).toBe(false);
  });

  it("uses withdraw for drafts and cancel for confirmed bookings", () => {
    expect(canWithdrawReservation(reservation())).toBe(true);
    expect(
      canWithdrawReservation(
        reservation({
          status: ReservationStatus.CANCELLED,
          requestExpiresAt: "2026-11-12T00:00:00Z",
        }),
      ),
    ).toBe(false);
    expect(
      canSelfServeCancel(reservation({ status: ReservationStatus.CONFIRMED })),
    ).toBe(true);
    expect(canSelfServeCancel(reservation())).toBe(false);
    expect(
      canWithdrawReservation(
        reservation({ status: ReservationStatus.CONFIRMED, requestExpiresAt: null }),
      ),
    ).toBe(false);
  });

  it("formats the instant-mode countdown and detects manual capture", () => {
    expect(formatCountdown(15 * 60 * 1000)).toBe("15:00");
    expect(formatCountdown(65_000)).toBe("01:05");
    expect(remainingPaymentMs("2026-11-11T16:15:00.000Z", Date.parse("2026-11-11T16:10:00.000Z"))).toBe(
      5 * 60 * 1000,
    );
    expect(isManualCapture(payment({ captureMethod: CaptureMethod.MANUAL }))).toBe(
      true,
    );
  });
});
