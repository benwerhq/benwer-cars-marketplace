import { cn } from "@/lib/utils";

const LOCKUP_WIDTH = 1612.571;
const LOCKUP_HEIGHT = 448;

interface BenwerLockupProps {
  alt: string;
  className?: string;
}

export function BenwerLockup({ alt, className }: BenwerLockupProps) {
  const imageClass = cn(
    "w-auto shrink-0 object-contain object-left",
    className,
  );

  return (
    <>
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
    </>
  );
}
