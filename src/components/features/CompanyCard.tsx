import Link from "next/link";
import { ArrowRight, Car, MapPin } from "lucide-react";
import { CompanyMark, hasCompanyLogo } from "./CompanyMark";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";

interface CompanyCardProps {
  company: Company;
  href: string;
  viewFleetLabel: string;
  /** Shown instead of the "View fleet" call to action when the company has no public cars. */
  noFleetLabel?: string;
  locationFallback?: string;
  descriptionFallback?: string;
  fleetHint?: string;
  isHighlighted?: boolean;
  onHighlight?: (slug: string | null) => void;
  className?: string;
}

export function CompanyCard({
  company,
  href,
  viewFleetLabel,
  noFleetLabel,
  locationFallback,
  descriptionFallback,
  fleetHint,
  isHighlighted = false,
  onHighlight,
  className,
}: CompanyCardProps) {
  const brandColor = company.branding.primaryColor || undefined;
  const hasFleet = company.vehicleCount !== 0;
  const hasLogo = hasCompanyLogo(company);

  return (
    <Link
      id={`company-${company.slug}`}
      href={href}
      onMouseEnter={() => onHighlight?.(company.slug)}
      onMouseLeave={() => onHighlight?.(null)}
      onFocus={() => onHighlight?.(company.slug)}
      onBlur={() => onHighlight?.(null)}
      className={cn(
        "group flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-3xl border border-border bg-surface transition-shadow duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:hover:shadow-md",
        isHighlighted && "ring-2 ring-primary/30",
        className,
      )}
    >
      <span
        aria-hidden
        className="block h-1.5 w-full bg-primary"
        style={brandColor ? { backgroundColor: brandColor } : undefined}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface p-1.5">
            <CompanyMark
              company={company}
              size="lg"
              className={
                hasLogo
                  ? "h-full max-h-full w-auto max-w-full object-center"
                  : "h-full w-full rounded-xl border-0"
              }
            />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-lg font-semibold tracking-tight break-words text-foreground">
              {company.name}
            </h3>
            {company.location || locationFallback ? (
              <p
                className={cn(
                  "mt-1 flex min-w-0 items-center gap-1.5 text-sm",
                  company.location ? "text-muted-foreground" : "text-subtle-foreground",
                )}
              >
                <MapPin size={14} className="shrink-0" aria-hidden />
                <span className="truncate">{company.location || locationFallback}</span>
              </p>
            ) : null}
          </div>
        </div>
        {company.description || descriptionFallback ? (
          <p
            className={cn(
              "mt-4 line-clamp-2 min-h-10 text-sm",
              company.description ? "text-muted-foreground" : "text-subtle-foreground italic",
            )}
          >
            {company.description || descriptionFallback}
          </p>
        ) : null}
        <div aria-hidden className="flex-1" />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border pt-4">
          {fleetHint ? (
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-sm font-medium text-foreground">
              <Car
                size={15}
                className="shrink-0 text-subtle-foreground"
                aria-hidden
              />
              <span className="truncate">{fleetHint}</span>
            </span>
          ) : (
            <span />
          )}
          {hasFleet || !noFleetLabel ? (
            <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-4 text-sm font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              {viewFleetLabel}
              <ArrowRight
                size={16}
                aria-hidden
                className="transition-transform motion-safe:group-hover:translate-x-0.5"
              />
            </span>
          ) : (
            <span className="inline-flex h-10 shrink-0 items-center px-1 text-sm font-medium text-muted-foreground underline-offset-4 group-hover:underline">
              {noFleetLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
