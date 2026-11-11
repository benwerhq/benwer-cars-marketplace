import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { NavRoutes } from "@/enums";
import { LocaleSwitcher } from "./LocaleSwitcher";

interface SiteFooterProps {
  companyName: string;
  homeHref: string;
}

export async function SiteFooter({ companyName, homeHref }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const tFooter = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tSite = await getTranslations("site");

  return (
    <footer className="mt-auto w-full border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 md:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex max-w-sm flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">{companyName}</p>
            <p className="text-sm text-muted-foreground">{tSite("footerTagline")}</p>
            <p className="text-xs text-muted-foreground">{tFooter("poweredBy")}</p>
          </div>
          <div className="flex flex-wrap gap-10">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {tFooter("explore")}
              </p>
              <Link
                href={homeHref}
                className="text-sm text-foreground hover:text-primary"
              >
                {tNav("home")}
              </Link>
              <Link
                href={`${homeHref}#fleet`}
                className="text-sm text-foreground hover:text-primary"
              >
                {tNav("cars")}
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {tFooter("legal")}
              </p>
              <Link href={NavRoutes.PRIVACY} className="text-sm text-foreground hover:text-primary">
                {tNav("privacy")}
              </Link>
              <Link href={NavRoutes.TERMS} className="text-sm text-foreground hover:text-primary">
                {tNav("terms")}
              </Link>
              <Link href={NavRoutes.COOKIES} className="text-sm text-foreground hover:text-primary">
                {tNav("cookies")}
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {tFooter("copyright", { year })}
          </p>
          <LocaleSwitcher />
        </div>
      </div>
    </footer>
  );
}
