import { Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ColorSchemeSwitcher } from "./ColorSchemeSwitcher";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SiteGuestLink, SiteOwnerMenu } from "./SiteGuestLink";
import { SiteCartLink } from "./SiteCartLink";
import { SiteHeaderMark } from "./SiteHeaderMark";
import { SiteHeaderShell } from "./SiteHeaderShell";
import { SiteNav } from "./SiteNav";
import type { SiteSectionId } from "@/enums";

interface SiteHeaderProps {
  companyName: string;
  logoUrl?: string | null;
  homeHref: string;
  fleetHref: string;
  sections?: SiteSectionId[];
  phone?: string | null;
  /** Company site slug; shows the cart icon when set. */
  cartSlug?: string;
  className?: string;
}

export async function SiteHeader({
  companyName,
  logoUrl,
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
      brand={
        <>
          <SiteHeaderMark companyName={companyName} logoUrl={logoUrl ?? null} />
          <span className="sr-only">{t("logoAlt", { name: companyName })}</span>
        </>
      }
    >
      <SiteNav homeHref={homeHref} fleetHref={fleetHref} sections={sections} />
      {phone ? (
        <a
          href={`tel:${phone}`}
          className="hidden items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:inline-flex"
        >
          <Phone size={15} aria-hidden />
          {phone}
        </a>
      ) : null}
      {cartSlug ? <SiteCartLink slug={cartSlug} homeHref={homeHref} /> : null}
      <SiteGuestLink homeHref={homeHref} />
      <ColorSchemeSwitcher />
      <LocaleSwitcher />
      <SiteOwnerMenu homeHref={homeHref} />
    </SiteHeaderShell>
  );
}
