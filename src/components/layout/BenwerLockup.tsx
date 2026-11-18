import { cn } from "@/lib/utils";

const LOCKUP_WIDTH = 1584.571;
const LOCKUP_HEIGHT = 420;

interface BenwerLockupProps {
  alt: string;
  className?: string;
}

export function BenwerLockup({ alt, className }: BenwerLockupProps) {
  const imageClass =
    "h-full w-auto max-w-none shrink-0 object-contain object-left";

  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- official SVG lockup skips the next/image optimizer */}
      <img
        src="/images/logo-benwer-cars-dark.svg"
        alt={alt}
        width={LOCKUP_WIDTH}
        height={LOCKUP_HEIGHT}
        className={cn(imageClass, "block dark:hidden")}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- official SVG lockup skips the next/image optimizer */}
      <img
        src="/images/logo-benwer-cars-white.svg"
        alt=""
        width={LOCKUP_WIDTH}
        height={LOCKUP_HEIGHT}
        className={cn(imageClass, "hidden dark:!block")}
      />
    </span>
  );
}
