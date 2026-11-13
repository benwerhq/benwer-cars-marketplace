import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { SupportFab } from "@/components/features/SupportFab";
import { NavRoutes } from "@/enums";
import { whatsappSupportHref } from "@/lib/whatsappSupport";
import { BrandLogo } from "./BrandLogo";
import { CookieSettingsLink } from "./CookieSettingsLink";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { siteFooterHeadingClass, siteFooterLinkClass } from "./SiteFooter";

export async function Footer() {
  const year = new Date().getFullYear();
  const isTenant = Boolean((await headers()).get("x-company-slug"));
  const tFooter = await getTranslations("footer");
  const tBrand = await getTranslations("brand");
  const tNav = await getTranslations("nav");
  const tSupport = await getTranslations("support");
  const whatsapp = isTenant
    ? null
    : whatsappSupportHref(tSupport("whatsappMessage"));

  return (
    <footer className="mt-auto w-full border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className="flex max-w-sm flex-col gap-2">
            <BrandLogo
              alt={tBrand("logoAlt")}
              variant="full"
              className="h-12 w-24"
            />
            <p className="text-sm text-muted-foreground">
              {tFooter("tagline")}
            </p>
            <p className="text-xs text-muted-foreground">
              {isTenant ? tFooter("poweredBy") : tFooter("trust")}
            </p>
          </div>
          <FooterGroup label={tFooter("explore")}>
            <FooterLink href={NavRoutes.HOME}>{tNav("home")}</FooterLink>
            {isTenant ? (
              <FooterLink href={`${NavRoutes.HOME}#fleet`}>
                {tNav("cars")}
              </FooterLink>
            ) : (
              <>
                <FooterLink href={NavRoutes.CARS}>{tNav("cars")}</FooterLink>
                <FooterLink href={NavRoutes.COMPANIES}>
                  {tNav("companies")}
                </FooterLink>
              </>
            )}
          </FooterGroup>
          <FooterGroup label={tNav("contact")}>
            <FooterLink href={NavRoutes.CONTACT}>{tNav("contact")}</FooterLink>
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={siteFooterLinkClass}
              >
                {tSupport("whatsappAction")}
              </a>
            ) : null}
          </FooterGroup>
          <FooterGroup label={tFooter("legal")}>
            <FooterLink href={NavRoutes.PRIVACY}>{tNav("privacy")}</FooterLink>
            <FooterLink href={NavRoutes.TERMS}>{tNav("terms")}</FooterLink>
            <FooterLink href={NavRoutes.COOKIES}>{tNav("cookies")}</FooterLink>
            <CookieSettingsLink
              className={`${siteFooterLinkClass} cursor-pointer text-left`}
            />
          </FooterGroup>
        </div>
        <div
          className={`flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between ${isTenant ? "" : "max-sm:pb-16"}`}
        >
          <p className="text-xs text-muted-foreground">
            {tFooter("copyright", { year })}
          </p>
          <LocaleSwitcher />
        </div>
      </div>
      {isTenant ? null : <SupportFab whatsappHref={whatsapp} />}
    </footer>
  );
}

function FooterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <nav aria-label={label} className="flex flex-col gap-2">
      <p className={siteFooterHeadingClass}>{label}</p>
      {children}
    </nav>
  );
}

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className={siteFooterLinkClass}>
      {children}
    </Link>
  );
}
