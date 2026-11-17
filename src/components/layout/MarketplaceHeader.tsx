import { getTranslations } from "next-intl/server";
import { NavRoutes } from "@/enums";
import { cn } from "@/lib/utils";
import { ColorSchemeSwitcher } from "./ColorSchemeSwitcher";
import { GuestNotificationBell } from "./GuestNotificationBell";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MarketplaceMobileMenu, MarketplaceNav } from "./MarketplaceNav";
import { SiteHeaderShell } from "./SiteHeaderShell";

const LOCKUP_WIDTH = 1612.571;
const LOCKUP_HEIGHT = 448;
const LOCKUP_CLASS =
  "h-6 w-auto shrink-0 object-contain object-left sm:h-9";

interface MarketplaceHeaderProps {
  className?: string;
}

function MarketplaceLockup({ alt }: { alt: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- official SVG lockup skips the next/image optimizer */}
      <img
        src="/images/logo-benwer-cars-dark.svg"
        alt={alt}
        width={LOCKUP_WIDTH}
        height={LOCKUP_HEIGHT}
        className={cn(LOCKUP_CLASS, "dark:hidden")}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- official SVG lockup skips the next/image optimizer */}
      <img
        src="/images/logo-benwer-cars-white.svg"
        alt=""
        width={LOCKUP_WIDTH}
        height={LOCKUP_HEIGHT}
        className={cn(LOCKUP_CLASS, "hidden dark:block")}
      />
    </>
  );
}

export async function MarketplaceHeader({ className }: MarketplaceHeaderProps) {
  const t = await getTranslations("brand");

  return (
    <SiteHeaderShell
      homeHref={NavRoutes.HOME}
      homeAriaLabel={t("homeAria")}
      className={className}
      barClassName="h-14 px-4 sm:h-[4.5rem] sm:px-8 md:px-8 lg:px-8"
      mobileMenu={<MarketplaceMobileMenu />}
      brand={<MarketplaceLockup alt={t("logoAlt")} />}
    >
      <MarketplaceNav />
      <ColorSchemeSwitcher />
      <LocaleSwitcher />
      <GuestNotificationBell />
    </SiteHeaderShell>
  );
}
