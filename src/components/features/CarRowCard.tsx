"use client";

import Link from "next/link";
import { ArrowRight, Car, Fuel, Settings2, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { TransmissionType } from "@/enums";
import { vehicleImageUrl } from "@/lib/vehicleImage";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";
import { CompanyEyebrow } from "./CompanyEyebrow";
import type { Vehicle } from "@/types/vehicle";
import { CarPhoto } from "./CarPhoto";

interface CarRowCardProps {
  vehicle: Vehicle;
  href: string;
  days: number | null;
  priority?: boolean;
  available?: boolean;
  company?: Pick<Company, "name" | "slug" | "branding"> | null;
}

function money(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CarRowCard({
  vehicle,
  href,
  days,
  priority = false,
  available = true,
  company,
}: CarRowCardProps) {
  const t = useTranslations("cars");
  const tDetail = useTranslations("carDetail");
  const locale = useLocale();
  const name = `${vehicle.brand} ${vehicle.model}`;
  const photo = vehicleImageUrl(vehicle);

  return (
    <Link
      href={href}
      className={cn(
        "group grid min-w-0 cursor-pointer grid-cols-1 overflow-hidden rounded-3xl border border-border bg-surface transition-shadow duration-200 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:hover:shadow-md",
        !available && "opacity-80",
      )}
    >
      <div className="relative aspect-[16/10] border-b border-border bg-surface sm:aspect-auto sm:min-h-52 sm:border-r sm:border-b-0">
        <CarPhoto
          key={photo ?? "empty"}
          src={photo}
          alt={name}
          priority={priority}
          sizes="(min-width: 640px) 15rem, 100vw"
          className="object-contain p-3"
          fallback={
            <div
              role="img"
              aria-label={tDetail("photoEmpty")}
              className="flex h-full items-center justify-center bg-surface-muted text-primary/20"
            >
              <Car size={56} strokeWidth={1.25} aria-hidden />
            </div>
          }
        />
        {!available ? (
          <span className="absolute top-3 left-3 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning">
            {t("notAvailableForDates")}
          </span>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col p-5">
        {company ? <CompanyEyebrow company={company} className="mb-2" /> : null}
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{name}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {vehicle.year} · {t(`types.${vehicle.type}`)}
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-foreground">
          <li className="flex items-center gap-2">
            <Users size={15} className="text-subtle-foreground" aria-hidden />
            {t("seats", { count: vehicle.seats })}
          </li>
          <li className="flex items-center gap-2">
            <Settings2 size={15} className="text-subtle-foreground" aria-hidden />
            {t(
              vehicle.transmission === TransmissionType.AUTOMATIC
                ? "transmission.automatic"
                : "transmission.manual",
            )}
          </li>
          <li className="flex items-center gap-2">
            <Fuel size={15} className="text-subtle-foreground" aria-hidden />
            {t(`fuel.${vehicle.fuel}`)}
          </li>
        </ul>
        <div aria-hidden className="flex-1" />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-dashed border-border pt-4">
          <div>
            <p className="leading-none whitespace-nowrap">
              <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {money(vehicle.pricePerDay, vehicle.currency, locale)}
              </span>
              <span className="text-sm text-muted-foreground">{t("perDaySuffix")}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {days && days > 0
                ? t("rowTotal", {
                    amount: money(vehicle.pricePerDay * days, vehicle.currency, locale),
                    days,
                  })
                : vehicle.deposit
                  ? t("rowDeposit", {
                      amount: money(vehicle.deposit, vehicle.currency, locale),
                    })
                  : null}
            </p>
          </div>
          {available ? (
            <span className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-all group-hover:bg-primary-hover group-hover:shadow-lg group-hover:shadow-primary/40 motion-safe:group-hover:-translate-y-px">
              {t("bookNow")}
              <ArrowRight
                size={16}
                aria-hidden
                className="transition-transform motion-safe:group-hover:translate-x-0.5"
              />
            </span>
          ) : (
            <span className="inline-flex h-11 items-center rounded-full bg-surface-muted px-5 text-sm font-medium text-muted-foreground">
              {t("bookUnavailable")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
