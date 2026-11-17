import { getTranslations } from "next-intl/server";
import { CompanyLogo } from "@/components/features/CompanyLogo";
import { NavRoutes } from "@/enums";
import { ColorSchemeSwitcher } from "./ColorSchemeSwitcher";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SiteHeaderShell } from "./SiteHeaderShell";
import { TenantMobileMenu, TenantNav } from "./TenantNav";

interface TenantHeaderProps {
  companyName: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  className?: string;
}

export async function TenantHeader({
  companyName,
  logoUrl,
  logoDarkUrl,
  className,
}: TenantHeaderProps) {
  const t = await getTranslations("tenant");

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
              branding: {
                primaryColor: "",
                logoUrl: logoUrl ?? null,
                logoDarkUrl: logoDarkUrl ?? null,
              },
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
