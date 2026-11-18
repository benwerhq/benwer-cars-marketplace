import { getTranslations } from "next-intl/server";
import { CompanyLogo } from "@/components/features/CompanyLogo";
import { logoPairBranding } from "@/lib/companyLogos";
import { NavRoutes } from "@/enums";
import type { LogoPair } from "@/types/company";
import { ColorSchemeSwitcher } from "./ColorSchemeSwitcher";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SiteHeaderShell } from "./SiteHeaderShell";
import { TenantMobileMenu, TenantNav } from "./TenantNav";

interface TenantHeaderProps {
  companyName: string;
  branding?: LogoPair | null;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  logoLightUrl?: string | null;
  className?: string;
}

export async function TenantHeader({
  companyName,
  branding,
  logoUrl,
  logoDarkUrl,
  logoLightUrl,
  className,
}: TenantHeaderProps) {
  const t = await getTranslations("tenant");
  const logos = branding ?? { logoUrl, logoDarkUrl, logoLightUrl };

  return (
    <SiteHeaderShell
      homeHref={NavRoutes.HOME}
      className={className}
      mobileMenu={<TenantMobileMenu />}
      brand={
        <>
          <CompanyLogo
            company={{
              name: companyName,
              branding: logoPairBranding(logos),
            }}
            size="md"
            className="max-w-[46vw]"
          />
          <span className="sr-only">{t("logoAlt", { name: companyName })}</span>
        </>
      }
    >
      <TenantNav />
      <ColorSchemeSwitcher />
      <LocaleSwitcher />
    </SiteHeaderShell>
  );
}
