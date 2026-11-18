import { getTranslations } from "next-intl/server";
import { ColorSchemeSwitcher } from "./ColorSchemeSwitcher";
import { GuestNotificationBell } from "./GuestNotificationBell";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SiteGuestLink, SiteOwnerMenu } from "./SiteGuestLink";
import { SiteCartLink } from "./SiteCartLink";
import { SiteHeaderMark } from "./SiteHeaderMark";
import { SiteHeaderShell } from "./SiteHeaderShell";
import { SiteMobileMenu, SiteNav } from "./SiteNav";
import type { SiteSectionId } from "@/enums";

interface SiteHeaderProps {
  companyName: string;
  brandColor?: string | null;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  logoLightUrl?: string | null;
  homeHref: string;
  fleetHref: string;
  sections?: SiteSectionId[];
  phone?: string | null;
  cartSlug?: string;
  className?: string;
}

export async function SiteHeader({
  companyName,
  brandColor,
  logoUrl,
  logoDarkUrl,
  logoLightUrl,
  homeHref,
  fleetHref,
  sections,
  phone,
  cartSlug,
  className,
}: SiteHeaderProps) {
  const t = await getTranslations("site");

  return (
    <SiteHeaderShell
      homeHref={homeHref}
      className={className}
      brandColor={brandColor}
      mobileMenu={
        <SiteMobileMenu
          homeHref={homeHref}
          fleetHref={fleetHref}
          sections={sections}
          phone={phone}
          cartSlug={cartSlug}
        />
      }
      brand={
        <>
          <SiteHeaderMark
            companyName={companyName}
            brandColor={brandColor}
            logoUrl={logoUrl ?? null}
            logoDarkUrl={logoDarkUrl ?? null}
            logoLightUrl={logoLightUrl ?? null}
          />
          <span className="sr-only">{t("logoAlt", { name: companyName })}</span>
        </>
      }
    >
      <SiteNav homeHref={homeHref} fleetHref={fleetHref} sections={sections}>
        <SiteGuestLink homeHref={homeHref} />
      </SiteNav>
      <ColorSchemeSwitcher />
      <LocaleSwitcher />
      <GuestNotificationBell siteSlug={cartSlug} />
      <SiteOwnerMenu homeHref={homeHref} />
      {cartSlug ? <SiteCartLink slug={cartSlug} homeHref={homeHref} /> : null}
    </SiteHeaderShell>
  );
}
