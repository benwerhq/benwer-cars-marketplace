"use client";

import { useVehicle } from "@/hooks/useVehicle";
import { SITE_CHANNEL } from "@/lib/site";
import type { Vehicle } from "@/types/vehicle";
import { BookingVehiclePreview } from "./BookingVehiclePreview";

interface ReservationVehicleProps {
  companySlug: string;
  vehicleId: string;
  fallback: Vehicle | null;
  companyName?: string | null;
}

export function ReservationVehicle({
  companySlug,
  vehicleId,
  fallback,
  companyName,
}: ReservationVehicleProps) {
  const { data } = useVehicle(companySlug, vehicleId, SITE_CHANNEL);
  const vehicle = data ?? fallback;

  if (!vehicle) {
    return null;
  }

  return (
    <BookingVehiclePreview
      vehicle={vehicle}
      companyName={companyName}
      size="md"
    />
  );
}
