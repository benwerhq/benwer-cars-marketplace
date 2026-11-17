import { cn } from "@/lib/utils";
import {
  BENWER_LOCKUP_ACCENT_PATHS,
  BENWER_LOCKUP_PATHS,
  BENWER_MARK_PATHS,
} from "./brandLogoPaths";

const VIEWBOX = {
  mark: "0 0 63.63 36",
  full: "0 0 152.84 36",
} as const;

const DEFAULT_CLASS = {
  mark: "h-9 w-16",
  full: "h-9 w-[9.55rem]",
} as const;

interface BrandLogoProps {
  alt: string;
  variant?: "full" | "mark";
  priority?: boolean;
  className?: string;
}

export function BrandLogo({
  alt,
  variant = "full",
  className,
}: BrandLogoProps) {
  const paths = variant === "mark" ? BENWER_MARK_PATHS : BENWER_LOCKUP_PATHS;
  const accent = variant === "full" ? BENWER_LOCKUP_ACCENT_PATHS : [];
  const labelled = Boolean(alt);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={VIEWBOX[variant]}
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      aria-label={labelled ? alt : undefined}
      fill="currentColor"
      fillRule="evenodd"
      className={cn(
        "shrink-0 text-foreground",
        DEFAULT_CLASS[variant],
        className,
      )}
    >
      {labelled ? <title>{alt}</title> : null}
      {paths.map((d, index) => (
        <path key={index} d={d} />
      ))}
      {accent.map((d, index) => (
        <path key={`accent-${index}`} d={d} className="fill-primary" />
      ))}
    </svg>
  );
}
