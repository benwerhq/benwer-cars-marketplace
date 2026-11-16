"use client";

import { Car } from "lucide-react";
import { useVehicle } from "@/hooks/useVehicle";
import { SITE_CHANNEL } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";
import { CarPhoto } from "./CarPhoto";

interface ReservationCarImageProps {
  companySlug: string;
  vehicleId: string;
  fallback: Vehicle | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

function realPhoto(vehicle: Vehicle | null | undefined): string | null {
  return (
    vehicle?.photos.find((url) => Boolean(url.trim())) ??
    vehicle?.photoUrl ??
    null
  );
}

export function ReservationCarImage({
  companySlug,
  vehicleId,
  fallback,
  alt,
  sizes,
  priority = false,
  className,
}: ReservationCarImageProps) {
  const { data } = useVehicle(companySlug, vehicleId, SITE_CHANNEL);
  const vehicle = data ?? fallback;
  const photo = realPhoto(vehicle);
  const categoryImage = vehicle?.categoryImageUrl ?? null;
  const placeholder = (
    <div className="flex h-full w-full items-center justify-center">
      <Car size={40} strokeWidth={1.5} className="text-primary/40" aria-hidden />
    </div>
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        photo || categoryImage
          ? "bg-surface"
          : "bg-gradient-to-br from-primary/5 via-surface-muted to-primary/10",
        className,
      )}
    >
      {photo ? (
        <CarPhoto src={photo} alt={alt} sizes={sizes} priority={priority} fallback={placeholder} />
      ) : categoryImage ? (
        <div className="absolute inset-0 flex items-center justify-center p-[8%]">
          <CarPhoto
            src={categoryImage}
            alt={alt}
            sizes={sizes}
            priority={priority}
            fit="contain"
            className="drop-shadow-md"
            fallback={placeholder}
          />
        </div>
      ) : (
        placeholder
      )}
    </div>
  );
}
