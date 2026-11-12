"use client";

import { useState } from "react";
import { toPublicMediaSrc } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";

interface CompanyEyebrowProps {
  company: Pick<Company, "name" | "branding">;
  className?: string;
}

export function CompanyEyebrow({ company, className }: CompanyEyebrowProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const logoSrc = company.branding.logoUrl
    ? toPublicMediaSrc(company.branding.logoUrl)
    : null;
  const showLogo = Boolean(logoSrc) && failedSrc !== logoSrc;
  const brandColor = company.branding.primaryColor || undefined;
  const initial = company.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <p className={cn("flex min-w-0 items-center gap-2", className)}>
      {showLogo && logoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- SVG logos skip the next/image optimizer
        <img
          src={logoSrc}
          alt=""
          onError={() => setFailedSrc(logoSrc)}
          className="block h-6 w-auto max-w-full shrink-0 rounded-sm object-contain"
        />
      ) : (
        <span
          aria-hidden
          style={brandColor ? { backgroundColor: brandColor } : undefined}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold",
            brandColor
              ? "text-primary-foreground"
              : "border border-border bg-surface-muted text-muted-foreground",
          )}
        >
          {initial}
        </span>
      )}
      <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {company.name}
      </span>
    </p>
  );
}
