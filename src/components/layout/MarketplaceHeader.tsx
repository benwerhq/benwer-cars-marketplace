import { getTranslations } from "next-intl/server";
import { NavRoutes } from "@/enums";
import { BrandLogo } from "./BrandLogo";
import { ColorSchemeSwitcher } from "./ColorSchemeSwitcher";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MarketplaceNav } from "./MarketplaceNav";
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
      brand={
        <>
          <BrandLogo
            alt={t("logoAlt")}
            variant="mark"
            priority
            className="h-9 w-12 shrink-0"
          />
          <span className="truncate text-sm font-semibold tracking-tight max-sm:hidden">
            {t("name")}
          </span>
        </>
      }
    >
      <MarketplaceNav />
      <ColorSchemeSwitcher />
      <LocaleSwitcher />
    </SiteHeaderShell>
  );
}
