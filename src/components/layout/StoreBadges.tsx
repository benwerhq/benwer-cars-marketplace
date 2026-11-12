import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StoreBadgeCopy {
  prefix: string;
  name: string;
  aria: string;
  href?: string;
}

function AppleMark() {
  return (
    <svg viewBox="0 0 16 20" width={20} height={24} aria-hidden className="shrink-0 fill-current">
      <path d="M13.02 10.64c-.02-2.13 1.74-3.15 1.82-3.2-1-1.46-2.55-1.66-3.1-1.68-1.32-.13-2.58.78-3.25.78-.68 0-1.72-.76-2.83-.74-1.46.02-2.8.85-3.55 2.16-1.52 2.63-.39 6.52 1.09 8.66.72 1.04 1.58 2.2 2.71 2.16 1.09-.04 1.5-.7 2.82-.7 1.32 0 1.69.7 2.84.68 1.17-.02 1.92-1.06 2.63-2.1.83-1.21 1.17-2.38 1.19-2.44-.03-.01-2.28-.87-2.3-3.46zM10.84 3.18c.6-.73 1-1.74.89-2.76-.86.04-1.9.57-2.52 1.3-.56.65-1.05 1.68-.92 2.67.97.08 1.96-.49 2.55-1.21z" />
    </svg>
  );
}

function PlayMark() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden className="shrink-0">
      <path
        d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12 3.84 21.85C3.34 21.6 3 21.09 3 20.5Z"
        className="fill-info"
      />
      <path d="M16.81 15.12 6.05 21.34 14.54 12.85 16.81 15.12Z" className="fill-success" />
      <path d="M16.81 8.88 14.54 11.15 6.05 2.66 16.81 8.88Z" className="fill-warning" />
      <path
        d="M20.16 10.81c.34.27.59.69.59 1.19s-.22.92-.57 1.19l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31Z"
        className="fill-danger"
      />
    </svg>
  );
}

function StoreBadge({
  prefix,
  name,
  aria,
  icon,
  href,
}: StoreBadgeCopy & { icon: ReactNode }) {
  const className = cn(
    "inline-flex h-12 w-full min-w-[10.75rem] items-center gap-3 rounded-lg border border-border-strong bg-foreground px-3.5 text-left text-background sm:w-auto",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    href
      ? "cursor-pointer transition-opacity hover:opacity-90"
      : "cursor-not-allowed opacity-45",
  );
  const body = (
    <>
      {icon}
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-[10px] font-normal tracking-wide opacity-90">{prefix}</span>
        <span className="text-sm font-semibold">{name}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={aria}
        className={className}
      >
        {body}
      </a>
    );
  }

  return (
    <button type="button" disabled aria-label={aria} className={className}>
      {body}
    </button>
  );
}

export function StoreBadges({
  appStore,
  googlePlay,
  className,
}: {
  appStore: StoreBadgeCopy;
  googlePlay: StoreBadgeCopy;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap", className)}
    >
      <StoreBadge {...appStore} icon={<AppleMark />} />
      <StoreBadge {...googlePlay} icon={<PlayMark />} />
    </div>
  );
}
