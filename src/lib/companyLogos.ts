import type { Company, CompanyBranding, LogoPair } from "@/types/company";

export function companyLogoPair(
  branding: LogoPair,
): Required<Pick<LogoPair, "logoUrl" | "logoDarkUrl">> {
  return {
    logoUrl: branding.wideLightLogoUrl ?? branding.logoUrl ?? null,
    logoDarkUrl:
      branding.wideDarkLogoUrl ??
      branding.logoDarkUrl ??
      branding.logoLightUrl ??
      null,
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
    logoUrl: logos?.logoUrl ?? null,
    logoLightUrl: logos?.logoLightUrl ?? null,
    logoDarkUrl: logos?.logoDarkUrl ?? null,
    wideLightLogoUrl: logos?.wideLightLogoUrl ?? null,
    wideDarkLogoUrl: logos?.wideDarkLogoUrl ?? null,
  };
}

export function hasCompanyLogo(company: Pick<Company, "branding">): boolean {
  const { logoUrl, logoDarkUrl } = companyLogoPair(company.branding);
  return Boolean(logoUrl || logoDarkUrl);
}
