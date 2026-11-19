import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_WIDTH = 1024;
const LOGO_HEIGHT = 512;

interface BenwerLockupProps {
  alt: string;
  className?: string;
  sizes?: string;
}

export function BenwerLockup({ alt, className, sizes = "128px" }: BenwerLockupProps) {
  return (
    <Image
      src="/images/logo-benwer-cars.webp"
      alt={alt}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      sizes={sizes}
      priority
      className={cn("w-auto max-w-none shrink-0 rounded-none object-contain", className)}
    />
  );
}
