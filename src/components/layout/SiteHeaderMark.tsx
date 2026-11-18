"use client";

import { CompanyLogo } from "@/components/features/CompanyLogo";
import { useSiteDraftLogo } from "@/context/SiteDraftLogoProvider";
import {
  brandHeaderTone,
  logoPairBranding,
  type LogoBackground,
} from "@/lib/companyLogos";
import { cssVarColor } from "@/lib/hexColor";

interface SiteHeaderMarkProps {
  companyName: string;
  logoUrl: string | null;
  logoDarkUrl?: string | null;
  logoLightUrl?: string | null;
  brandColor?: string | null;
}

function headerBackground(brandColor?: string | null, draftColor?: string | null): LogoBackground {
  const tone = brandHeaderTone(draftColor ?? brandColor);
  if (tone) {
    return tone;
  }
  return "theme";
}

export function SiteHeaderMark({
  companyName,
  logoUrl,
  logoDarkUrl,
  logoLightUrl,
  brandColor,
}: SiteHeaderMarkProps) {
  const draft = useSiteDraftLogo();
  const logos = draft?.headerLogo ?? { logoUrl, logoDarkUrl, logoLightUrl };
  const onBackground = headerBackground(
    brandColor,
    cssVarColor(draft?.themeStyle, "--site-primary"),
  );

  const company = { name: companyName, branding: logoPairBranding(logos) };

  if (onBackground === "theme") {
    return (
      <CompanyLogo company={company} size="header" onBackground="theme" className="max-w-full" />
    );
  }

  // Brand-coloured header only on small screens; larger screens keep the
  // normal surface header, so the logo follows the site theme there.
  return (
    <>
      <span className="flex h-full max-w-full items-center sm:hidden">
        <CompanyLogo
          company={company}
          size="header"
          onBackground={onBackground}
          className="max-w-full"
        />
      </span>
      <span className="flex h-full max-w-full items-center max-sm:hidden">
        <CompanyLogo company={company} size="header" onBackground="theme" className="max-w-full" />
      </span>
    </>
  );
}
