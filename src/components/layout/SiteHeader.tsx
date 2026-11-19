import { getTranslations } from "next-intl/server";
import { ColorSchemeSwitcher } from "./ColorSchemeSwitcher";
import { GuestNotificationBell } from "./GuestNotificationBell";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SiteGuestLink, SiteOwnerMenu } from "./SiteGuestLink";
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
  /** Company site slug; scopes guest notification links to this site. */
  siteSlug?: string;
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
  siteSlug,
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
      <GuestNotificationBell siteSlug={siteSlug} />
      <SiteOwnerMenu homeHref={homeHref} />
    </SiteHeaderShell>
  );
}
