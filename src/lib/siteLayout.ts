import { SiteLayout } from "@/enums";

export const SITE_LAYOUTS: SiteLayout[] = [
  SiteLayout.CLASSIC,
  SiteLayout.MODERN_HERO,
  SiteLayout.MINIMAL_LIST,
  SiteLayout.GRID_GALLERY,
  SiteLayout.BOLD_LANDING,
];

export function parseSiteLayout(value: string | undefined | null): SiteLayout {
  switch (value) {
    case SiteLayout.MODERN_HERO:
    case "modern-hero":
    case "modernHero":
      return SiteLayout.MODERN_HERO;
    case SiteLayout.MINIMAL_LIST:
    case "minimal-list":
    case "minimalList":
      return SiteLayout.MINIMAL_LIST;
    case SiteLayout.GRID_GALLERY:
    case "grid-gallery":
    case "gridGallery":
      return SiteLayout.GRID_GALLERY;
    case SiteLayout.BOLD_LANDING:
    case "bold-landing":
    case "boldLanding":
      return SiteLayout.BOLD_LANDING;
    default:
      return SiteLayout.CLASSIC;
  }
}

export function isSiteLayout(value: string): value is SiteLayout {
  return SITE_LAYOUTS.includes(value as SiteLayout);
}
