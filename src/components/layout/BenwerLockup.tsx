import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_WIDTH = 1024;
const LOGO_HEIGHT = 512;

interface BenwerLockupProps {
  alt: string;
  className?: string;
}

export function BenwerLockup({ alt, className }: BenwerLockupProps) {
  return (
    <Image
      src="/images/logo-benwer-cars.webp"
      alt={alt}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority
      className={cn("w-auto max-w-none shrink-0 rounded-lg object-contain", className)}
    />
  );
}
