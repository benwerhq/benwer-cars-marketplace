"use client";

import { useState } from "react";
import {
  COMPANY_HEADER_LOGO_CLASS,
  COMPANY_LOGO_HEIGHT_CLASS,
  companyLogoPair,
  logoSrcForBackground,
  type LogoBackground,
} from "@/lib/companyLogos";
import { toPublicMediaSrc } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";

interface CompanyLogoProps {
  company: Pick<Company, "name" | "branding">;
  size?: CompanyLogoSize;
  className?: string;
  onBackground?: LogoBackground;
}

const HEIGHT_CLASS = {
  ...COMPANY_LOGO_HEIGHT_CLASS,
  header: COMPANY_HEADER_LOGO_CLASS,
} as const;

export type CompanyLogoSize = keyof typeof HEIGHT_CLASS;

const NAME_CLASS: Record<CompanyLogoSize, string> = {
  inline: "text-sm font-medium",
  car: "text-sm font-semibold tracking-tight",
  card: "text-base font-semibold tracking-tight",
  banner: "text-lg font-semibold tracking-tight",
  footer: "text-lg font-semibold tracking-tight",
  header: "text-base font-semibold tracking-tight",
};

export {
  COMPANY_HEADER_BAR_CLASS,
  COMPANY_HEADER_LOGO_CLASS,
  COMPANY_LOGO_HEIGHT_CLASS,
  COMPANY_LOGO_MIN_HEIGHT_PX,
  companyLogoPair,
  hasCompanyLogo,
  logoPairBranding,
} from "@/lib/companyLogos";

export function CompanyLogo({
  company,
  size = "card",
  className,
  onBackground = "theme",
}: CompanyLogoProps) {
  const [failed, setFailed] = useState<Record<string, true>>({});
  const pair = companyLogoPair(company.branding);
  const light = pair.logoUrl ?? pair.logoDarkUrl;
  const dark = pair.logoDarkUrl ?? pair.logoUrl;
  const forced =
    onBackground === "theme" ? null : logoSrcForBackground(company.branding, onBackground);

  const showLight = publicLogoSrc(forced ?? light);
  const showDark = forced ? null : publicLogoSrc(dark);
  const lightSrc = showLight && !failed[showLight] ? showLight : null;
  const darkSrc = showDark && !failed[showDark] ? showDark : null;
  const fallbackSrc = lightSrc ?? darkSrc;

  if (!fallbackSrc) {
    return (
      <span className={cn("min-w-0 truncate text-current", NAME_CLASS[size], className)}>
        {company.name}
      </span>
    );
  }

  function markFailed(src: string) {
    setFailed((current) => ({ ...current, [src]: true }));
  }

  if (lightSrc && darkSrc && lightSrc !== darkSrc) {
    return (
      <>
        <LogoImage
          src={lightSrc}
          size={size}
          className={cn("dark:hidden", className)}
          onError={() => markFailed(lightSrc)}
        />
        <LogoImage
          src={darkSrc}
          size={size}
          className={cn("hidden dark:block", className)}
          onError={() => markFailed(darkSrc)}
        />
      </>
    );
  }

  return (
    <LogoImage
      src={fallbackSrc}
      size={size}
      className={className}
      onError={() => markFailed(fallbackSrc)}
    />
  );
}

function publicLogoSrc(value: string | null | undefined): string | null {
  return value ? toPublicMediaSrc(value) ?? null : null;
}

function LogoImage({
  src,
  className,
  size,
  onError,
}: {
  src: string;
  className?: string;
  size: CompanyLogoSize;
  onError: () => void;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG logos skip the next/image optimizer
    <img
      src={src}
      alt=""
      onError={onError}
      className={cn(
        "w-auto max-w-full min-w-0 shrink rounded-none object-contain object-left",
        HEIGHT_CLASS[size],
        className,
      )}
    />
  );
}
