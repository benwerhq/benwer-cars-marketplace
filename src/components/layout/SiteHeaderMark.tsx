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

  return (
    <CompanyLogo
      company={{ name: companyName, branding: logoPairBranding(logos) }}
      size="header"
      onBackground={onBackground}
      className="max-w-[min(70vw,22rem)]"
    />
  );
}
