import Link from "next/link";
import { ArrowRight, Car, MapPin } from "lucide-react";
import { CompanyMark } from "./CompanyMark";
import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";

interface CompanyCardProps {
  company: Company;
  href: string;
  viewFleetLabel: string;
  fleetHint?: string;
  isHighlighted?: boolean;
  onHighlight?: (slug: string | null) => void;
  className?: string;
}

export function CompanyCard({
  company,
  href,
  viewFleetLabel,
  fleetHint,
  isHighlighted = false,
  onHighlight,
  className,
}: CompanyCardProps) {
  const brandColor = company.branding.primaryColor || undefined;

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
          <CompanyMark company={company} size="lg" className="rounded-2xl" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold tracking-tight text-foreground">
              {company.name}
            </h3>
            {company.location ? (
              <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin size={14} className="shrink-0" aria-hidden />
                <span className="truncate">{company.location}</span>
              </p>
            ) : null}
          </div>
        </div>
        {company.description ? (
          <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
            {company.description}
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
          <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-4 text-sm font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {viewFleetLabel}
            <ArrowRight
              size={16}
              aria-hidden
              className="transition-transform motion-safe:group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
