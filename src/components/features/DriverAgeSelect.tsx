"use client";

import { ChevronDown, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/SelectMenu";
import { DriverAgeBand } from "@/enums";

interface DriverAgeSelectProps {
  id: string;
  value: DriverAgeBand;
  onChange: (next: DriverAgeBand) => void;
}

export function DriverAgeSelect({ id, value, onChange }: DriverAgeSelectProps) {
  const t = useTranslations("site");
  const options: SelectMenuOption[] = Object.values(DriverAgeBand).map(
    (band) => ({
      value: band,
      label: t("driverAgeYears", { band: t(`driverAgeBands.${band}`) }),
    }),
  );

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{t("driverAge")}</span>
      <SelectMenu
        id={id}
        value={value}
        onValueChange={(next) => onChange(next as DriverAgeBand)}
        options={options}
        ariaLabel={t("driverAge")}
        align="end"
        triggerClassName="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted py-1 pr-2 pl-3 text-sm font-semibold text-foreground transition-colors hover:border-border-strong data-[state=open]:border-border-strong"
        contentClassName="w-48"
      >
        <UserRound size={14} className="text-subtle-foreground" aria-hidden />
        {t(`driverAgeBands.${value}`)}
        <ChevronDown
          size={14}
          className="text-subtle-foreground transition-transform group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </SelectMenu>
    </div>
  );
}
