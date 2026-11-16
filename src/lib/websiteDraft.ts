import { SiteStatus } from "@/enums";
import { serializeAppearance } from "@/lib/siteContent";
import type { PublicSite } from "@/types/site";
import type { WebsiteSettings, WebsiteSettingsPatch } from "@/types/websiteSettings";

export function settingsFromSite(site: PublicSite): WebsiteSettings {
  return {
    status: site.status,
    bookingMode: site.bookingMode,
    minLeadHours: site.minLeadHours,
    requestWindowHours: site.requestWindowHours,
    headline: { ...site.headline },
    intro: { ...site.intro },
    showPhone: site.showPhone,
    showEmail: site.showEmail,
    showAddress: site.showAddress,
    revision: 0,
    hasUnpublishedChanges: false,
    canPublish: true,
    content: site.content,
    canEdit: true,
  };
}

export function siteBrandColor(site: PublicSite): string {
  return site.content.brandColor || site.company.branding.primaryColor;
}

export function applyWebsiteDraft(site: PublicSite, draft: WebsiteSettings): PublicSite {
  return {
    ...site,
    status: draft.status,
    bookingMode: draft.bookingMode,
    minLeadHours: draft.minLeadHours,
    requestWindowHours: draft.requestWindowHours,
    headline: draft.headline,
    intro: draft.intro,
    showPhone: draft.showPhone,
    showEmail: draft.showEmail,
    showAddress: draft.showAddress,
    content: { ...draft.content, reviews: site.content.reviews },
    allowDifferentReturn: site.oneWayRentals && draft.content.allowDifferentReturn,
  };
}

export function toWebsitePatch(draft: WebsiteSettings): WebsiteSettingsPatch {
  return {
    revision: draft.revision,
    bookingMode: draft.bookingMode,
    minLeadHours: draft.minLeadHours,
    requestWindowHours: draft.requestWindowHours,
    headline: draft.headline,
    intro: draft.intro,
    showPhone: draft.showPhone,
    showEmail: draft.showEmail,
    showAddress: draft.showAddress,
    layout: "classic",
    appearance: serializeAppearance(draft.content),
  };
}

function comparable(value: WebsiteSettings): string {
  return JSON.stringify({ ...toWebsitePatch(value), revision: 0 });
}

export function websiteDraftDirty(saved: WebsiteSettings, draft: WebsiteSettings): boolean {
  return comparable(saved) !== comparable(draft);
}

export function isLive(status: SiteStatus): boolean {
  return status === SiteStatus.PUBLISHED;
}
