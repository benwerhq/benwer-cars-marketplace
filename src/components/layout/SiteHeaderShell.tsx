"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useSiteDraftLogo } from "@/context/SiteDraftLogoProvider";
import { brandHeaderTone, COMPANY_HEADER_BAR_CLASS } from "@/lib/companyLogos";
import { cssVarColor, isHexColor } from "@/lib/hexColor";
import { cn } from "@/lib/utils";

interface SiteHeaderShellProps {
  homeHref: string;
  brand: ReactNode;
  children: ReactNode;
  mobileMenu: ReactNode;
  homeAriaLabel?: string;
  className?: string;
  barClassName?: string;
  brandLinkClassName?: string;
  brandColor?: string | null;
}

export { COMPANY_HEADER_BAR_CLASS };

function liveBrandColor(
  brandColor: string | null | undefined,
  themeStyle: CSSProperties | undefined,
): string | null {
  return (
    cssVarColor(themeStyle, "--site-primary") ??
    (brandColor && isHexColor(brandColor) ? brandColor : null)
  );
}

export function SiteHeaderShell({
  homeHref,
  brand,
  children,
  mobileMenu,
  homeAriaLabel,
  className,
  barClassName,
  brandLinkClassName,
  brandColor,
}: SiteHeaderShellProps) {
  const draft = useSiteDraftLogo();
  const color = liveBrandColor(brandColor, draft?.themeStyle);
  const tone = brandHeaderTone(color);

  return (
    <header
      className={cn(
        "site-header sticky top-0 z-40 w-full border-b shadow-sm",
        "border-border bg-surface",
        tone && "max-sm:border-transparent",
        className,
      )}
      data-brand-header={tone ?? undefined}
      style={
        color
          ? ({ "--brand-header-bg": color } as CSSProperties)
          : undefined
      }
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-stretch justify-between gap-3 px-3 sm:px-6 lg:px-8",
          COMPANY_HEADER_BAR_CLASS,
          barClassName,
        )}
      >
        <Link
          href={homeHref}
          aria-label={homeAriaLabel}
          className={cn(
            "header-brand flex h-full min-w-0 flex-1 items-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            brandLinkClassName,
          )}
        >
          {brand}
        </Link>
        <div className="flex shrink-0 items-center gap-3 max-sm:hidden sm:gap-4">
          {children}
        </div>
        <div className="flex shrink-0 items-center sm:hidden">{mobileMenu}</div>
      </div>
    </header>
  );
}
