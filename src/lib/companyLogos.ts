import { isHexColor, isLightHex } from "@/lib/hexColor";
import type { Company, CompanyBranding, LogoPair } from "@/types/company";

// Mobile keeps the readable 64px minimum from the branded header.
// On desktop, company logos match the marketplace header lockup (h-12 / 48px).
export const COMPANY_LOGO_MIN_HEIGHT_PX = 64;
export const COMPANY_LOGO_HEIGHT_CLASS = "h-16 sm:h-12";
// Company-site header: full-height logo in a 64px bar below sm; from sm up the
// bar matches the marketplace header (72px) and the logo is 48px, not full-bleed.
export const COMPANY_HEADER_BAR_CLASS = "h-16 sm:h-[4.5rem]";
export const COMPANY_HEADER_LOGO_CLASS = "h-full max-h-full sm:h-12 sm:max-h-12";

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
