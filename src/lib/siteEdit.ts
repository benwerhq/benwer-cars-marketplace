import { SiteEditSection, SiteEditTab } from "@/enums";
import { previewQueryValue } from "@/lib/publicChannel";

export const DEFAULT_ADMIN_ORIGIN = "https://cars-admin.benwer.es";

export function parseEditFlag(
  value: string | string[] | undefined,
): boolean {
  const flag = Array.isArray(value) ? value[0] : value;
  return flag === "1";
}

export function isSiteEditMode(input: {
  isPreview: boolean;
  preview?: string;
  edit?: boolean;
}): boolean {
  return (
    input.isPreview &&
    Boolean(previewQueryValue(input.preview)) &&
    Boolean(input.edit)
  );
}

export function adminWebsiteHref(
  tab: SiteEditTab,
  section: SiteEditSection,
  adminOrigin = DEFAULT_ADMIN_ORIGIN,
): string {
  const origin = adminOrigin.replace(/\/$/, "") || DEFAULT_ADMIN_ORIGIN;
  const url = new URL("/website", `${origin}/`);
  url.searchParams.set("tab", tab);
  url.searchParams.set("section", section);
  return url.toString();
}

export function tabForSection(section: SiteEditSection): SiteEditTab {
  if (section === SiteEditSection.RULES) {
    return SiteEditTab.RULES;
  }

  if (section === SiteEditSection.DOMAIN) {
    return SiteEditTab.DOMAIN;
  }

  return SiteEditTab.LOOK;
}

export const OPEN_OWNER_EDITOR_EVENT = "benwer:open-owner-editor";
export const OWNER_EDITOR_HASH = "editor";
