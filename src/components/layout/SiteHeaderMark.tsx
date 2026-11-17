"use client";

import { CompanyLogo } from "@/components/features/CompanyLogo";
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
    <CompanyLogo
      company={{ name: companyName, branding: { primaryColor: "", ...logos } }}
      size="md"
      className="max-w-[46vw]"
    />
  );
}
