import { getTranslations } from "next-intl/server";
import { CompanyMark } from "@/components/features/CompanyMark";
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
          <CompanyMark
            company={{
              name: companyName,
              branding: {
                primaryColor: "",
                logoUrl: logoUrl ?? null,
                logoDarkUrl: logoDarkUrl ?? null,
              },
            }}
            size="sm"
            className="h-8 w-24 max-w-[46vw] sm:h-9 sm:w-28"
          />
          <span className="truncate text-sm font-semibold tracking-tight">
            {companyName}
          </span>
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
