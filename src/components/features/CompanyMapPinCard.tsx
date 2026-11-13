import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { getCityDisplayName } from "@/data/malagaCities";
import type { CompanyMapPin } from "@/lib/companyMap";
import { cn } from "@/lib/utils";

interface CompanyMapPinCardProps {
  pin: CompanyMapPin;
  locale: string;
  onClose: () => void;
  className?: string;
}

export function CompanyMapPinCard({
  pin,
  locale,
  onClose,
  className,
}: CompanyMapPinCardProps) {
  const t = useTranslations("map");
  const cityName = getCityDisplayName(pin.city, locale);

  return (
    <article className={cn("flex w-64 flex-col gap-3 p-4", className)}>
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold text-foreground">
          {pin.name}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin size={12} aria-hidden />
          {cityName}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        {pin.vehicleCount == null
          ? t("fleetHintUnknown")
          : t("fleetHint", { count: pin.vehicleCount })}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={pin.href}
          className={cn(
            "marketplace-map-popup-cta inline-flex text-primary-foreground h-8 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-medium transition-colors",
            "hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          {t("viewFleet")}
          <ChevronRight size={16} aria-hidden />
        </Link>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t("closePin")}
        </Button>
      </div>
    </article>
  );
}
