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
      barClassName="px-4 sm:px-8 md:px-8 lg:px-8"
      brandLinkClassName="flex-none shrink-0"
      brandBackground={{ color: "var(--promo)", tone: "dark" }}
      mobileMenu={<MarketplaceMobileMenu />}
      brand={
        <BenwerLockup
          alt={t("logoAlt")}
          className="h-14 sm:h-12"
          sizes="(max-width: 639px) 112px, 96px"
        />
      }
    >
      <MarketplaceNav />
      <ColorSchemeSwitcher />
      <LocaleSwitcher />
      <GuestNotificationBell />
    </SiteHeaderShell>
  );
}
