import { isHexColor, isLightHex } from "@/lib/hexColor";
import type { Company, CompanyBranding, LogoPair } from "@/types/company";

export const COMPANY_LOGO_MIN_HEIGHT_PX = 56;
export const COMPANY_LOGO_HEIGHT_CLASS = "h-14 sm:h-16";

function logoSrc(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function companyLogoPair(
  branding: LogoPair,
): Required<Pick<LogoPair, "logoUrl" | "logoDarkUrl">> {
  return {
    logoUrl:
      logoSrc(branding.wideLightLogoUrl) ?? logoSrc(branding.logoUrl),
    logoDarkUrl:
      logoSrc(branding.wideDarkLogoUrl) ??
      logoSrc(branding.logoDarkUrl) ??
      logoSrc(branding.logoLightUrl),
  };
}

export function logoPairBranding(
  logos:
    | LogoPair
    | {
        logoUrl?: string | null;
        logoLightUrl?: string | null;
        logoDarkUrl?: string | null;
        wideLightLogoUrl?: string | null;
        wideDarkLogoUrl?: string | null;
      }
    | null
    | undefined,
): CompanyBranding {
  return {
    primaryColor: "",
    logoUrl: logoSrc(logos?.logoUrl),
    logoLightUrl: logoSrc(logos?.logoLightUrl),
    logoDarkUrl: logoSrc(logos?.logoDarkUrl),
    wideLightLogoUrl: logoSrc(logos?.wideLightLogoUrl),
    wideDarkLogoUrl: logoSrc(logos?.wideDarkLogoUrl),
  };
}

export function hasCompanyLogo(company: Pick<Company, "branding">): boolean {
  const { logoUrl, logoDarkUrl } = companyLogoPair(company.branding);
  return Boolean(logoUrl || logoDarkUrl);
}

export type LogoBackground = "theme" | "light" | "dark";

export function logoSrcForBackground(
  branding: LogoPair,
  background: Exclude<LogoBackground, "theme">,
): string | null {
  const pair = companyLogoPair(branding);
  if (background === "dark") {
    return pair.logoDarkUrl ?? pair.logoUrl;
  }
  return pair.logoUrl ?? pair.logoDarkUrl;
}

export function brandHeaderTone(
  color: string | null | undefined,
): "light" | "dark" | null {
  if (!color || !isHexColor(color)) {
    return null;
  }
  return isLightHex(color) ? "light" : "dark";
}

export function brandColorFromLogos(
  branding:
    | (LogoPair & { primaryColor?: string | null })
    | null
    | undefined,
): string | null {
  const color = branding?.primaryColor?.trim();
  return color && isHexColor(color) ? color : null;
}
