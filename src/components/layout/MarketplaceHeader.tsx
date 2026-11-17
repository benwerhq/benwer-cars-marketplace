import { getTranslations } from "next-intl/server";
import { NavRoutes } from "@/enums";
import { BrandLogo } from "./BrandLogo";
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
      mobileMenu={<MarketplaceMobileMenu />}
      brand={
        <>
          <BrandLogo
            alt={t("logoAlt")}
            variant="mark"
            priority
            className="h-8 w-[3.55rem] sm:hidden"
          />
          <BrandLogo
            alt=""
            variant="full"
            priority
            className="hidden h-9 w-[9.55rem] sm:block"
          />
        </>
      }
    >
      <MarketplaceNav />
      <ColorSchemeSwitcher />
      <LocaleSwitcher />
      <GuestNotificationBell />
    </SiteHeaderShell>
  );
}
