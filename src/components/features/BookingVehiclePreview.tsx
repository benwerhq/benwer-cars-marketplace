import { Car } from "lucide-react";
import { useTranslations } from "next-intl";
import { vehicleImageUrl } from "@/lib/vehicleImage";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";
import { CarPhoto } from "./CarPhoto";

interface BookingVehiclePreviewProps {
  vehicle: Vehicle;
  companyName?: string | null;
  size?: "sm" | "md";
}

export function BookingVehiclePreview({
  vehicle,
  companyName,
  size = "sm",
}: BookingVehiclePreviewProps) {
  const t = useTranslations("carDetail");
  const name = `${vehicle.brand} ${vehicle.model}`;
  const photo = vehicleImageUrl(vehicle);
  const thumbClass = size === "md" ? "h-20 w-28 sm:h-24 sm:w-36" : "h-16 w-24";

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg bg-surface-muted",
          thumbClass,
        )}
      >
        <CarPhoto
          src={photo}
          alt={name}
          sizes={size === "md" ? "144px" : "96px"}
          fallback={
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-primary/5">
              <Car
                size={size === "md" ? 28 : 20}
                className="text-primary/40"
                aria-hidden
              />
              <span className="sr-only">{t("photoEmpty")}</span>
            </div>
          }
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{vehicle.year}</p>
        {companyName ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {companyName}
          </p>
        ) : null}
      </div>
    </div>
  );
}
