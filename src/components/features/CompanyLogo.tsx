"use client";

import { useState } from "react";
import { toPublicMediaSrc } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Company, CompanyBranding, LogoPair } from "@/types/company";

interface CompanyLogoProps {
  company: Pick<Company, "name" | "branding">;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const HEIGHT_CLASS = {
  sm: "h-6",
  md: "h-8 sm:h-9",
  lg: "h-12",
} as const;

const NAME_CLASS = {
  sm: "text-sm font-medium",
  md: "text-sm font-semibold tracking-tight",
  lg: "text-lg font-semibold tracking-tight",
} as const;

export function companyLogoPair(
  branding: Pick<
    CompanyBranding,
    "logoUrl" | "logoDarkUrl" | "wideLightLogoUrl" | "wideDarkLogoUrl"
  >,
): Required<LogoPair> {
  return {
    logoUrl: branding.wideLightLogoUrl ?? branding.logoUrl,
    logoDarkUrl: branding.wideDarkLogoUrl ?? branding.logoDarkUrl ?? null,
  };
}

export function hasCompanyLogo(company: Pick<Company, "branding">): boolean {
  const { logoUrl, logoDarkUrl } = companyLogoPair(company.branding);
  return Boolean(logoUrl || logoDarkUrl);
}

export function CompanyLogo({
  company,
  size = "md",
  className,
}: CompanyLogoProps) {
  const [failed, setFailed] = useState<Record<string, true>>({});
  const pair = companyLogoPair(company.branding);
  const lightSrc = pair.logoUrl ? toPublicMediaSrc(pair.logoUrl) : null;
  const darkSrc = pair.logoDarkUrl ? toPublicMediaSrc(pair.logoDarkUrl) : null;
  const lightOk = lightSrc != null && !failed[lightSrc];
  const darkOk = darkSrc != null && !failed[darkSrc];
  const imageClass = cn(
    "shrink-0 bg-transparent object-contain object-left",
    HEIGHT_CLASS[size],
    "w-auto max-w-full",
    className,
  );

  if (!lightOk && !darkOk) {
    return (
      <span
        className={cn(
          "min-w-0 truncate text-foreground",
          NAME_CLASS[size],
          className,
        )}
      >
        {company.name}
      </span>
    );
  }

  return (
    <>
      {lightSrc && lightOk ? (
        // eslint-disable-next-line @next/next/no-img-element -- SVG logos skip the next/image optimizer
        <img
          src={lightSrc}
          alt=""
          onError={() => setFailed((current) => ({ ...current, [lightSrc]: true }))}
          className={cn(imageClass, "dark:hidden", !darkOk && "dark:block")}
        />
      ) : null}
      {darkSrc && darkOk ? (
        // eslint-disable-next-line @next/next/no-img-element -- SVG logos skip the next/image optimizer
        <img
          src={darkSrc}
          alt=""
          onError={() => setFailed((current) => ({ ...current, [darkSrc]: true }))}
          className={cn(imageClass, "hidden dark:block", !lightOk && "block")}
        />
      ) : null}
    </>
  );
}
