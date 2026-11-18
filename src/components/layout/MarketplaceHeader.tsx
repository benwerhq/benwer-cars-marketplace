import { getTranslations } from "next-intl/server";
import { NavRoutes } from "@/enums";
import { BenwerLockup } from "./BenwerLockup";
import { ColorSchemeSwitcher } from "./ColorSchemeSwitcher";
import { GuestNotificationBell } from "./GuestNotificationBell";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MarketplaceMobileMenu, MarketplaceNav } from "./MarketplaceNav";
import { SiteHeaderShell } from "./SiteHeaderShell";

interface MarketplaceHeaderProps {
  className?: string;
}

export async function MarketplaceHeader({ className }: MarketplaceHeaderProps) {
  const t = await getTranslations("brand");

  return (
    <SiteHeaderShell
      homeHref={NavRoutes.HOME}
      homeAriaLabel={t("homeAria")}
      className={className}
      barClassName="h-14 px-4 sm:h-[4.5rem] sm:px-8 md:px-8 lg:px-8"
      brandLinkClassName="flex-none shrink-0"
      mobileMenu={<MarketplaceMobileMenu />}
      brand={<BenwerLockup alt={t("logoAlt")} className="h-10 sm:h-12" />}
    >
      <MarketplaceNav />
      <ColorSchemeSwitcher />
      <LocaleSwitcher />
      <GuestNotificationBell />
    </SiteHeaderShell>
  );
}
