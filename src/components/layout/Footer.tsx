import Link from "next/link";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { NavRoutes } from "@/enums";
import { BrandLogo } from "./BrandLogo";
import { LocaleSwitcher } from "./LocaleSwitcher";

export async function Footer() {
  const year = new Date().getFullYear();
  const isTenant = Boolean((await headers()).get("x-company-slug"));
  const tFooter = await getTranslations("footer");
  const tBrand = await getTranslations("brand");
  const tNav = await getTranslations("nav");

  return (
    <footer className="mt-auto w-full border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 md:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex max-w-xs flex-col gap-3">
            <BrandLogo
              alt={tBrand("logoAlt")}
              variant="full"
              className="h-14 w-28"
            />
            <p className="text-sm text-muted-foreground">
              {tFooter("tagline")}
            </p>
            <p className="text-xs text-muted-foreground">
              {isTenant ? tFooter("poweredBy") : tFooter("trust")}
            </p>
          </div>
          <div className="flex flex-wrap gap-10">
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
              <FooterLink href={NavRoutes.CONTACT}>
                {tNav("contact")}
              </FooterLink>
            </FooterGroup>
            <FooterGroup label={tFooter("legal")}>
              <FooterLink href={NavRoutes.PRIVACY}>
                {tNav("privacy")}
              </FooterLink>
              <FooterLink href={NavRoutes.TERMS}>{tNav("terms")}</FooterLink>
              <FooterLink href={NavRoutes.COOKIES}>
                {tNav("cookies")}
              </FooterLink>
            </FooterGroup>
          </div>
          <LocaleSwitcher />
        </div>
        <p className="text-xs text-subtle-foreground">
          {tFooter("copyright", { year })}
        </p>
      </div>
    </footer>
  );
}

function FooterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <nav className="flex min-w-36 flex-col gap-2" aria-label={label}>
      <p className="text-xs font-semibold uppercase tracking-wider text-subtle-foreground">
        {label}
      </p>
      {children}
    </nav>
  );
}

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {children}
    </Link>
  );
}
