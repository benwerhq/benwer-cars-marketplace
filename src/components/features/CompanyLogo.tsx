"use client";

import { useState } from "react";
import { companyLogoPair } from "@/lib/companyLogos";
import { toPublicMediaSrc } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";

interface CompanyLogoProps {
  company: Pick<Company, "name" | "branding">;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const HEIGHT_CLASS = {
  sm: "h-6 rounded-md",
  md: "h-8 rounded-lg sm:h-9",
  lg: "h-12 rounded-xl",
} as const;

const NAME_CLASS = {
  sm: "text-sm font-medium",
  md: "text-sm font-semibold tracking-tight",
  lg: "text-lg font-semibold tracking-tight",
} as const;

export {
  companyLogoPair,
  hasCompanyLogo,
  logoPairBranding,
} from "@/lib/companyLogos";

/**
 * One logo per company. Logos carry their own brand background, so the same
 * artwork is shown untouched in light and dark mode (never inverted).
 */
export function CompanyLogo({ company, size = "md", className }: CompanyLogoProps) {
  const [failed, setFailed] = useState<Record<string, true>>({});
  const pair = companyLogoPair(company.branding);
  const src = [pair.logoUrl, pair.logoDarkUrl]
    .map((url) => (url ? toPublicMediaSrc(url) : null))
    .find((url): url is string => url != null && !failed[url]);

  if (!src) {
    return (
      <span className={cn("min-w-0 truncate text-foreground", NAME_CLASS[size], className)}>
        {company.name}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG logos skip the next/image optimizer
    <img
      src={src}
      alt=""
      onError={() => setFailed((current) => ({ ...current, [src]: true }))}
      className={cn(
        "w-auto max-w-full shrink-0 object-contain object-left",
        HEIGHT_CLASS[size],
        className,
      )}
    />
  );
}
