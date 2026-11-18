import { cn } from "@/lib/utils";
import type { Company } from "@/types/company";
import { CompanyLogo, hasCompanyLogo } from "./CompanyLogo";

interface CompanyEyebrowProps {
  company: Pick<Company, "name" | "branding">;
  className?: string;
  showName?: boolean;
}

export function CompanyEyebrow({
  company,
  className,
  showName = true,
}: CompanyEyebrowProps) {
  const withLogo = hasCompanyLogo(company);

  return (
    <div className={cn("flex min-w-0 flex-col items-start gap-2", className)}>
      {withLogo ? <CompanyLogo company={company} className="max-w-full" /> : null}
      {showName || !withLogo ? (
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {company.name}
        </p>
      ) : null}
    </div>
  );
}
