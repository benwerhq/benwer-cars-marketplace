import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SiteHeaderShellProps {
  homeHref: string;
  brand: ReactNode;
  children: ReactNode;
  mobileMenu: ReactNode;
  homeAriaLabel?: string;
  className?: string;
  barClassName?: string;
}

export function SiteHeaderShell({
  homeHref,
  brand,
  children,
  mobileMenu,
  homeAriaLabel,
  className,
  barClassName,
}: SiteHeaderShellProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full overflow-x-clip border-b border-border bg-surface shadow-sm",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-6 lg:px-8",
          barClassName,
        )}
      >
        <Link
          href={homeHref}
          aria-label={homeAriaLabel}
          className="flex min-w-0 items-center gap-3 text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {brand}
        </Link>
        <div className="flex shrink-0 items-center gap-3 max-sm:hidden sm:gap-4">
          {children}
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:hidden">{mobileMenu}</div>
      </div>
    </header>
  );
}
