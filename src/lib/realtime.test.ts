import { describe, expect, it, vi } from "vitest";
import type { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/enums";
import {
  companySlugFromPathname,
  createInvalidationDebouncer,
  parseGuestRealtimeEvent,
  parsePublicRealtimeEvent,
  parseTokenReservationEvent,
  queryKeysForGuestEvent,
  queryKeysForPublicEvent,
} from "@/lib/realtime";

describe("marketplace realtime helpers", () => {
  it("extracts company slug from /s/[slug] paths", () => {
    expect(companySlugFromPathname("/s/sol-rent/cars/123")).toBe("sol-rent");
    expect(companySlugFromPathname("/s/sol-rent")).toBe("sol-rent");
    expect(companySlugFromPathname("/cars")).toBeNull();
    expect(companySlugFromPathname(null)).toBeNull();
  });

  it("parses public, guest, and token events safely", () => {
    expect(
      parsePublicRealtimeEvent({
        id: "1",
        entity: "vehicle",
        type: "updated",
        companySlug: "sol-rent",
        entityId: "v-1",
        at: "2026-11-19T12:00:00Z",
      }),
    ).toMatchObject({ entity: "vehicle", companySlug: "sol-rent", entityId: "v-1" });

    expect(
      parseGuestRealtimeEvent({
        id: "2",
        guestAccountId: "g-1",
        type: "reservation.cancelled",
        reservationId: "r-1",
        at: "2026-11-19T12:00:00Z",
      }),
    ).toMatchObject({ type: "reservation.cancelled", reservationId: "r-1" });

    expect(
      parseTokenReservationEvent({
        id: "3",
        type: "payment",
        at: "2026-11-19T12:00:00Z",
      }),
    ).toEqual({ id: "3", type: "payment", at: "2026-11-19T12:00:00Z" });

    expect(parsePublicRealtimeEvent({ entity: "vehicle" })).toBeNull();
  });

  it("maps public and guest events to targeted QueryKeys", () => {
    expect(
      queryKeysForPublicEvent({
        id: "1",
        entity: "extra",
        type: "updated",
        companySlug: "sol-rent",
        at: "2026-11-19T12:00:00Z",
      }),
    ).toEqual(expect.arrayContaining(["public-extras", QueryKeys.PRICE_QUOTE]));

    expect(
      queryKeysForGuestEvent({
        id: "2",
        guestAccountId: "g-1",
        type: "payment.updated",
        reservationId: "r-1",
        at: "2026-11-19T12:00:00Z",
      }),
    ).toEqual(
      expect.arrayContaining([
        QueryKeys.GUEST_RESERVATIONS,
        QueryKeys.RESERVATION,
        QueryKeys.PAYMENT,
        QueryKeys.CANCELLATION_QUOTE,
      ]),
    );
  });

  it("debounces and invalidates active queries only", () => {
    vi.useFakeTimers();
    try {
      const invalidateQueries = vi.fn().mockResolvedValue(undefined);
      const client = { invalidateQueries } as unknown as QueryClient;
      const debouncer = createInvalidationDebouncer(client, { delayMs: 250 });

      debouncer.enqueue([QueryKeys.VEHICLES]);
      debouncer.enqueue([QueryKeys.VEHICLES, QueryKeys.SITE]);
      vi.advanceTimersByTime(250);

      expect(invalidateQueries).toHaveBeenCalledTimes(2);
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: [QueryKeys.VEHICLES],
        refetchType: "active",
      });
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: [QueryKeys.SITE],
        refetchType: "active",
      });
    } finally {
      vi.useRealTimers();
    }
  });
});
