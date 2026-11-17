"use client";

import { useState } from "react";
import { companyLogoPair } from "@/lib/companyLogos";
import { toPublicMediaSrc } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";

export type CompanyLogoScheme = "auto" | "light" | "dark";

interface CompanyLogoProps {
  company: Pick<Company, "name" | "branding">;
  size?: "sm" | "md" | "lg";
  className?: string;
  scheme?: CompanyLogoScheme;
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

export {
  companyLogoPair,
  hasCompanyLogo,
  logoPairBranding,
} from "@/lib/companyLogos";

export function CompanyLogo({
  company,
  size = "md",
  className,
  scheme = "auto",
}: CompanyLogoProps) {
  const [failed, setFailed] = useState<Record<string, true>>({});
  const pair = companyLogoPair(company.branding);
  const blackSrc = pair.logoUrl ? toPublicMediaSrc(pair.logoUrl) : null;
  const whiteSrc = pair.logoDarkUrl ? toPublicMediaSrc(pair.logoDarkUrl) : null;
  const same = Boolean(blackSrc && whiteSrc && blackSrc === whiteSrc);
  const blackOk = blackSrc != null && !failed[blackSrc];
  const whiteOk = whiteSrc != null && !failed[whiteSrc] && !same;
  const imageClass = cn(
    "shrink-0 bg-transparent object-contain object-left",
    HEIGHT_CLASS[size],
    "w-auto max-w-full",
    className,
  );

  if (!blackOk && !whiteOk) {
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

  function markFailed(src: string) {
    setFailed((current) => ({ ...current, [src]: true }));
  }

  if (scheme === "light") {
    if (blackOk && blackSrc) {
      return (
        // eslint-disable-next-line @next/next/no-img-element -- SVG logos skip the next/image optimizer
        <img src={blackSrc} alt="" onError={() => markFailed(blackSrc)} className={imageClass} />
      );
    }
    return whiteSrc ? (
      // eslint-disable-next-line @next/next/no-img-element -- SVG logos skip the next/image optimizer
      <img
        src={whiteSrc}
        alt=""
        onError={() => markFailed(whiteSrc)}
        className={cn(imageClass, "invert")}
      />
    ) : null;
  }

  if (scheme === "dark") {
    if (whiteOk && whiteSrc) {
      return (
        // eslint-disable-next-line @next/next/no-img-element -- SVG logos skip the next/image optimizer
        <img src={whiteSrc} alt="" onError={() => markFailed(whiteSrc)} className={imageClass} />
      );
    }
    return blackSrc ? (
      // eslint-disable-next-line @next/next/no-img-element -- SVG logos skip the next/image optimizer
      <img
        src={blackSrc}
        alt=""
        onError={() => markFailed(blackSrc)}
        className={cn(imageClass, "invert")}
      />
    ) : null;
  }

  if (blackOk && whiteOk && blackSrc && whiteSrc) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG logos skip the next/image optimizer */}
        <img
          src={blackSrc}
          alt=""
          onError={() => markFailed(blackSrc)}
          className={cn(imageClass, "block dark:hidden")}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG logos skip the next/image optimizer */}
        <img
          src={whiteSrc}
          alt=""
          onError={() => markFailed(whiteSrc)}
          className={cn(imageClass, "hidden dark:!block")}
        />
      </>
    );
  }

  if (blackOk && blackSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- SVG logos skip the next/image optimizer
      <img
        src={blackSrc}
        alt=""
        onError={() => markFailed(blackSrc)}
        className={cn(imageClass, "dark:invert")}
      />
    );
  }

  return whiteSrc ? (
    // eslint-disable-next-line @next/next/no-img-element -- SVG logos skip the next/image optimizer
    <img
      src={whiteSrc}
      alt=""
      onError={() => markFailed(whiteSrc)}
      className={cn(imageClass, "invert dark:invert-0")}
    />
  ) : null;
}
