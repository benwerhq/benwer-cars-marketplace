"use client";

import { CompanyLogo } from "@/components/features/CompanyLogo";
import { logoPairBranding } from "@/lib/companyLogos";
import { useSiteDraftLogo } from "@/context/SiteDraftLogoProvider";

interface SiteHeaderMarkProps {
  companyName: string;
  logoUrl: string | null;
  logoDarkUrl?: string | null;
  logoLightUrl?: string | null;
}

export function SiteHeaderMark({
  companyName,
  logoUrl,
  logoDarkUrl,
  logoLightUrl,
}: SiteHeaderMarkProps) {
  const draft = useSiteDraftLogo();
  const logos = draft?.headerLogo ?? { logoUrl, logoDarkUrl, logoLightUrl };

  return (
    <CompanyLogo
      company={{ name: companyName, branding: logoPairBranding(logos) }}
      size="md"
      className="max-w-[46vw]"
    />
  );
}
