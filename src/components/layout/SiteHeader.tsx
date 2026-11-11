import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CompanyMark } from "@/components/features/CompanyMark";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SiteNav } from "./SiteNav";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  companyName: string;
  logoUrl?: string | null;
  homeHref: string;
  fleetHref: string;
  className?: string;
}

export async function SiteHeader({
  companyName,
  logoUrl,
  homeHref,
  fleetHref,
  className,
}: SiteHeaderProps) {
  const t = await getTranslations("site");

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full overflow-x-clip border-b border-border bg-primary/5 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 md:px-6 lg:px-8">
        <Link
          href={homeHref}
          className="flex min-w-0 items-center gap-2.5 text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <CompanyMark
            company={{
              name: companyName,
              branding: { primaryColor: "", logoUrl: logoUrl ?? null },
            }}
            size="sm"
            className="h-8 w-8 rounded-lg"
          />
          <span className="truncate text-sm font-semibold tracking-tight">
            {companyName}
          </span>
          <span className="sr-only">{t("logoAlt", { name: companyName })}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
          <SiteNav homeHref={homeHref} fleetHref={fleetHref} />
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
