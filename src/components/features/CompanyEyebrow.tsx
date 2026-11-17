import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";
import { CompanyLogo, hasCompanyLogo } from "./CompanyLogo";

interface CompanyEyebrowProps {
  company: Pick<Company, "name" | "branding">;
  className?: string;
}

export function CompanyEyebrow({ company, className }: CompanyEyebrowProps) {
  const withLogo = hasCompanyLogo(company);

  return (
    <p className={cn("flex min-w-0 items-center gap-2", className)}>
      {withLogo ? <CompanyLogo company={company} size="sm" /> : null}
      <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {company.name}
      </span>
    </p>
  );
}
