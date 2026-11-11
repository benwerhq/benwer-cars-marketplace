import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SiteSectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SiteSectionHeading({
  id,
  eyebrow,
  title,
  description,
  action,
  className,
}: SiteSectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-primary">{eyebrow}</p>
        <h2
          id={id}
          className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
