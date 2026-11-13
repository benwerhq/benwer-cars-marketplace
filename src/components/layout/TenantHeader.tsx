import { getTranslations } from "next-intl/server";
import { CompanyMark } from "@/components/features/CompanyMark";
import { NavRoutes } from "@/enums";
import { ColorSchemeSwitcher } from "./ColorSchemeSwitcher";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SiteHeaderShell } from "./SiteHeaderShell";
import { TenantNav } from "./TenantNav";

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
            className="h-9 w-9 rounded-lg"
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
