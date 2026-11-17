import type { Company } from "@/types/company";
import type { MarketplaceVehicle, Vehicle } from "@/types/vehicle";

export function resolveCardCompany(
  vehicle: Vehicle,
  companies?: Company[] | null,
): Pick<Company, "name" | "slug" | "branding"> | null {
  const nested =
    "company" in vehicle ? (vehicle as MarketplaceVehicle).company : null;
  const listed =
    companies?.find((company) => company.slug === vehicle.companySlug) ?? null;

  if (!nested && !listed) {
    return null;
  }

  return {
    name: nested?.name || listed?.name || vehicle.companySlug,
    slug: nested?.slug || listed?.slug || vehicle.companySlug,
    branding: {
      primaryColor:
        nested?.branding.primaryColor || listed?.branding.primaryColor || "",
      logoUrl: nested?.branding.logoUrl ?? listed?.branding.logoUrl ?? null,
      logoDarkUrl:
        nested?.branding.logoDarkUrl ?? listed?.branding.logoDarkUrl ?? null,
      wideLightLogoUrl:
        nested?.branding.wideLightLogoUrl ??
        listed?.branding.wideLightLogoUrl ??
        null,
      wideDarkLogoUrl:
        nested?.branding.wideDarkLogoUrl ??
        listed?.branding.wideDarkLogoUrl ??
        null,
    },
  };
}
