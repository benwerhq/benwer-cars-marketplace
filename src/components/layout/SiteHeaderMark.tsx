"use client";

import { CompanyMark } from "@/components/features/CompanyMark";
import { useSiteDraftLogo } from "@/context/SiteDraftLogoProvider";

interface SiteHeaderMarkProps {
  companyName: string;
  logoUrl: string | null;
}

export function SiteHeaderMark({ companyName, logoUrl }: SiteHeaderMarkProps) {
  const draft = useSiteDraftLogo();
  const src = draft?.headerLogo === undefined ? logoUrl : draft.headerLogo;

  return (
    <>
      <CompanyMark
        company={{ name: companyName, branding: { primaryColor: "", logoUrl: src } }}
        size="sm"
        className="h-9 w-9 rounded-lg"
      />
      <span className="truncate text-sm font-semibold tracking-tight">
        {companyName}
      </span>
    </>
  );
}
