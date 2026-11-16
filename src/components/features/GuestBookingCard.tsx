"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/money";
import type { GuestReservation } from "@/types/reservation";
import { ReservationCarImage } from "./ReservationCarImage";
import { ReservationTrip } from "./ReservationTrip";

interface GuestBookingCardProps {
  reservation: GuestReservation;
  companySlug: string;
  href: string;
}

export function GuestBookingCard({
  reservation,
  companySlug,
  href,
}: GuestBookingCardProps) {
  const t = useTranslations("guest");
  const tStatus = useTranslations("reservationStatus");
  const locale = useLocale();
  const vehicle = reservation.vehicle ?? null;
  const name = vehicle
    ? `${vehicle.brand} ${vehicle.model}`.trim()
    : t("bookingFallback");
  const reference = (reservation.token || reservation.id).slice(0, 8).toUpperCase();

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-row"
    >
      <ReservationCarImage
        companySlug={reservation.companySlug || companySlug}
        vehicleId={reservation.vehicleId}
        fallback={vehicle}
        alt={name}
        sizes="(min-width: 640px) 224px, 100vw"
        className="aspect-[16/9] w-full shrink-0 border-b border-border sm:aspect-auto sm:w-56 sm:border-r sm:border-b-0"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">{name}</p>
            {vehicle && vehicle.year > 0 ? (
              <p className="text-xs text-muted-foreground">{vehicle.year}</p>
            ) : null}
          </div>
          <StatusBadge
            status={reservation.status}
            label={tStatus(`status.${reservation.status}`)}
            className="shrink-0"
          />
        </div>
        <ReservationTrip
          startDate={reservation.startDate}
          endDate={reservation.endDate}
          pickupTime={reservation.pickupTime}
          returnTime={reservation.returnTime}
        />
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            {tStatus("reference")}{" "}
            <span className="font-mono font-medium tracking-wide text-foreground">
              {reference}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-base font-semibold tabular-nums text-foreground">
            {formatMoney(reservation.totalPrice, reservation.currency, locale)}
            <ChevronRight
              size={18}
              className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
