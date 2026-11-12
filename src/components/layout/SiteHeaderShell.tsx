import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SiteHeaderShellProps {
  homeHref: string;
  brand: ReactNode;
  children: ReactNode;
  homeAriaLabel?: string;
  className?: string;
}

export function SiteHeaderShell({
  homeHref,
  brand,
  children,
  homeAriaLabel,
  className,
}: SiteHeaderShellProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full overflow-x-clip border-b border-border bg-surface shadow-sm",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 md:px-6 lg:px-8">
        <Link
          href={homeHref}
          aria-label={homeAriaLabel}
          className="flex min-w-0 items-center gap-2.5 text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {brand}
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
          {children}
        </div>
      </div>
    </header>
  );
}
