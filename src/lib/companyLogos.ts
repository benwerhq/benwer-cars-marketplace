import type { Company, CompanyBranding, LogoPair } from "@/types/company";

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
