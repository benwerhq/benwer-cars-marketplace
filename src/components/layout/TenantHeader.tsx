import { getTranslations } from "next-intl/server";
import { CompanyLogo } from "@/components/features/CompanyLogo";
import { brandColorFromLogos, brandHeaderTone, logoPairBranding } from "@/lib/companyLogos";
import { NavRoutes } from "@/enums";
import type { LogoPair } from "@/types/company";
import { ColorSchemeSwitcher } from "./ColorSchemeSwitcher";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SiteHeaderShell } from "./SiteHeaderShell";
import { TenantMobileMenu, TenantNav } from "./TenantNav";

interface TenantHeaderProps {
  companyName: string;
  branding?: (LogoPair & { primaryColor?: string | null }) | null;
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
  const brandColor = brandColorFromLogos(branding);
  const onBackground = brandHeaderTone(brandColor) ?? "theme";
  const company = { name: companyName, branding: logoPairBranding(logos) };

  return (
    <SiteHeaderShell
      homeHref={NavRoutes.HOME}
      className={className}
      brandColor={brandColor}
      mobileMenu={<TenantMobileMenu />}
      brand={
        <>
          {onBackground === "theme" ? (
            <CompanyLogo
              company={company}
              size="header"
              onBackground="theme"
              className="max-w-full"
            />
          ) : (
            <>
              <span className="flex h-full max-w-full items-center sm:hidden">
                <CompanyLogo
                  company={company}
                  size="header"
                  onBackground={onBackground}
                  className="max-w-full"
                />
              </span>
              <span className="flex h-full max-w-full items-center max-sm:hidden">
                <CompanyLogo
                  company={company}
                  size="header"
                  onBackground="theme"
                  className="max-w-full"
                />
              </span>
            </>
          )}
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
