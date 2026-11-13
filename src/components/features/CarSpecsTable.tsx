"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import type { Vehicle } from "@/types/vehicle";
import { TransmissionType, VehicleCategory } from "@/enums";
import { vehicleCategoryOf } from "@/lib/vehicleFilters";

interface CarSpecsTableProps {
  vehicle: Vehicle;
  className?: string;
}

export function CarSpecsTable({ vehicle, className }: CarSpecsTableProps) {
  const t = useTranslations("carDetail");
  const tCars = useTranslations("cars");
  const locale = useLocale();

  const specs = [
    vehicle.year > 0
      ? { label: t("year"), value: String(vehicle.year), titleCase: false }
      : null,
    {
      label: t("type"),
      value: tCars(`types.${vehicle.type}`),
      titleCase: false,
    },
    vehicleCategoryOf(vehicle) !== VehicleCategory.OTHER &&
    String(vehicleCategoryOf(vehicle)) !== String(vehicle.type)
      ? {
          label: t("category"),
          value: tCars(`categories.${vehicleCategoryOf(vehicle)}`),
          titleCase: false,
        }
      : null,
    {
      label: t("transmission"),
      value: tCars(
        vehicle.transmission === TransmissionType.AUTOMATIC
          ? "transmission.automatic"
          : "transmission.manual",
      ),
      titleCase: false,
    },
    {
      label: t("fuel"),
      value: tCars(`fuel.${vehicle.fuel}`),
      titleCase: false,
    },
    vehicle.seats > 0
      ? {
          label: t("seats"),
          value: tCars("seats", { count: vehicle.seats }),
          titleCase: false,
        }
      : null,
    vehicle.color
      ? { label: t("color"), value: vehicle.color, titleCase: true }
      : null,
    vehicle.deposit != null
      ? {
          label: t("deposit"),
          value: formatMoney(vehicle.deposit, vehicle.currency, locale),
          titleCase: false,
        }
      : null,
    vehicle.mileage != null
      ? {
          label: t("mileage"),
          value: t("mileageValue", {
            count: vehicle.mileage,
          }),
          titleCase: false,
        }
      : null,
  ].filter(
    (row): row is { label: string; value: string; titleCase: boolean } =>
      row !== null,
  );

  if (specs.length === 0) {
    return null;
  }

  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-3",
        className,
      )}
    >
      {specs.map(({ label, value, titleCase }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd
            className={cn(
              "text-sm font-medium text-foreground",
              titleCase && "capitalize",
            )}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
