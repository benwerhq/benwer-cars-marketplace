"use client";

import { useState } from "react";
import { toPublicMediaSrc } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";

interface CompanyMarkProps {
  company: Pick<Company, "name" | "branding">;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS = {
  sm: "h-7 w-7 rounded-full text-[11px]",
  md: "h-12 w-12 rounded-full text-lg sm:h-14 sm:w-14",
  lg: "h-14 w-14 rounded-full text-xl",
} as const;

const LOGO_HEIGHT = {
  sm: "h-7",
  md: "h-12 sm:h-14",
  lg: "h-14",
} as const;

export function hasCompanyLogo(company: Pick<Company, "branding">): boolean {
  return Boolean(company.branding.logoUrl);
}

export function CompanyMark({
  company,
  size = "md",
  className,
}: CompanyMarkProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const logoSrc = company.branding.logoUrl
    ? toPublicMediaSrc(company.branding.logoUrl)
    : null;

  if (logoSrc && failedSrc !== logoSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- SVG logos skip the next/image optimizer
      <img
        src={logoSrc}
        alt=""
        onError={() => setFailedSrc(logoSrc)}
        className={cn(
          "block max-w-[11rem] shrink-0 object-contain object-left",
          LOGO_HEIGHT[size],
          className,
          "w-auto rounded-none border-0 bg-transparent p-0",
        )}
      />
    );
  }

  const initial = company.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center border border-border bg-surface-muted font-medium text-muted-foreground",
        SIZE_CLASS[size],
        className,
      )}
    >
      {initial}
    </span>
  );
}
