"use client";

import { CompanyMark } from "@/components/features/CompanyMark";
import { useSiteDraftLogo } from "@/context/SiteDraftLogoProvider";

interface SiteHeaderMarkProps {
  companyName: string;
  logoUrl: string | null;
  logoDarkUrl?: string | null;
}

export function SiteHeaderMark({ companyName, logoUrl, logoDarkUrl }: SiteHeaderMarkProps) {
  const draft = useSiteDraftLogo();
  const logos = draft?.headerLogo ?? { logoUrl, logoDarkUrl };

  return (
    <>
      <CompanyMark
        company={{ name: companyName, branding: { primaryColor: "", ...logos } }}
        size="sm"
        className="h-9 w-9 rounded-lg"
      />
      <span className="truncate text-sm font-semibold tracking-tight">
        {companyName}
      </span>
    </>
  );
}
