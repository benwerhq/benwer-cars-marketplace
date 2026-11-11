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
    <svg
      viewBox="0 0 24 24"
      width={22}
      height={22}
      aria-hidden
      className="shrink-0 fill-current"
    >
      <path d="M16.365 12.84c.02 2.16 1.89 2.88 1.91 2.89-.02.06-.3 1.03-1 2.02-.6.86-1.22 1.71-2.2 1.73-.96.02-1.27-.57-2.37-.57-1.1 0-1.44.55-2.35.59-.94.04-1.66-.93-2.27-1.78-1.24-1.75-2.19-4.94-.91-7.1.63-1.08 1.76-1.77 2.98-1.79.93-.02 1.81.63 2.37.63.56 0 1.61-.77 2.72-.66.46.02 1.76.19 2.6 1.41-.07.04-1.55.91-1.53 2.63ZM14.17 6.9c.5-.61 1.34-1.07 2.03-1.1-.09.85-.49 1.7-1.08 2.31-.55.58-1.46 1.03-2.23.97-.1-.81.33-1.66.78-2.18Z" />
    </svg>
  );
}

function PlayMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      aria-hidden
      className="shrink-0 fill-current"
    >
      <path d="M5 3.2v17.6l14.4-8.8L5 3.2z" />
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
    "inline-flex h-12 w-full min-w-[10.75rem] items-center gap-3 rounded-lg bg-secondary px-3.5 text-left text-secondary-foreground sm:w-auto",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    href
      ? "cursor-pointer transition-colors hover:bg-secondary-hover"
      : "cursor-not-allowed opacity-60",
  );
  const body = (
    <>
      {icon}
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-[10px] font-medium tracking-wide">{prefix}</span>
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
