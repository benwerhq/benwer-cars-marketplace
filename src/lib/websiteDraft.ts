import type { PublicSite } from "@/types/site";
import type { WebsiteSettings } from "@/types/websiteSettings";

export function settingsFromSite(site: PublicSite): WebsiteSettings {
  return {
    layout: site.layout,
    status: site.status,
    bookingMode: site.bookingMode,
    minLeadHours: site.minLeadHours,
    requestWindowHours: site.requestWindowHours,
    headline: { ...site.headline },
    intro: { ...site.intro },
    showPhone: site.showPhone,
    showEmail: site.showEmail,
    showAddress: site.showAddress,
    primaryColor: site.company.branding.primaryColor,
    domain: site.canonicalUrl ?? "",
    canEdit: true,
  };
}

export function applyWebsiteDraft(
  site: PublicSite,
  draft: WebsiteSettings,
): PublicSite {
  return {
    ...site,
    layout: draft.layout,
    status: draft.status,
    bookingMode: draft.bookingMode,
    minLeadHours: draft.minLeadHours,
    requestWindowHours: draft.requestWindowHours,
    headline: draft.headline,
    intro: draft.intro,
    showPhone: draft.showPhone,
    showEmail: draft.showEmail,
    showAddress: draft.showAddress,
    canonicalUrl: draft.domain || site.canonicalUrl,
    company: {
      ...site.company,
      branding: {
        ...site.company.branding,
        primaryColor: draft.primaryColor || site.company.branding.primaryColor,
      },
    },
  };
}

export function websiteDraftDirty(
  saved: WebsiteSettings,
  draft: WebsiteSettings,
): boolean {
  return JSON.stringify(omitCanEdit(saved)) !== JSON.stringify(omitCanEdit(draft));
}

function omitCanEdit(value: WebsiteSettings): Omit<WebsiteSettings, "canEdit"> {
  return {
    layout: value.layout,
    status: value.status,
    bookingMode: value.bookingMode,
    minLeadHours: value.minLeadHours,
    requestWindowHours: value.requestWindowHours,
    headline: value.headline,
    intro: value.intro,
    showPhone: value.showPhone,
    showEmail: value.showEmail,
    showAddress: value.showAddress,
    primaryColor: value.primaryColor,
    domain: value.domain,
  };
}
