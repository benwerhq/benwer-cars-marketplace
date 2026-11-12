import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CompanyMark } from "@/components/features/CompanyMark";
import { NavRoutes } from "@/enums";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { TenantNav } from "./TenantNav";

interface TenantHeaderProps {
  companyName: string;
  logoUrl?: string | null;
  className?: string;
}

export async function TenantHeader({
  companyName,
  logoUrl,
  className,
}: TenantHeaderProps) {
  const t = await getTranslations("tenant");

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full overflow-x-clip border-b border-border bg-primary/5 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 md:px-6 lg:px-8">
        <Link
          href={NavRoutes.HOME}
          className="flex min-w-0 items-center gap-2.5 text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <CompanyMark
            company={{
              name: companyName,
              branding: { primaryColor: "", logoUrl: logoUrl ?? null },
            }}
            size="sm"
            className="h-9 w-9 rounded-lg"
          />
          <span
            className={
              logoUrl ? "sr-only" : "truncate text-sm font-semibold tracking-tight"
            }
          >
            {companyName}
          </span>
          <span className="sr-only">{t("logoAlt", { name: companyName })}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
          <TenantNav />
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
