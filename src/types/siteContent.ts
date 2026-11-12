import type {
  SiteBannerPreset,
  SiteBannerTarget,
  SiteCornerStyle,
  SiteFontFamily,
  SiteIncludedIcon,
  SiteIncludedPreset,
  SitePaymentMethod,
  SiteSectionId,
} from "@/enums";

export type LocalizedCopy = Record<string, string>;

export interface SiteSectionConfig {
  id: SiteSectionId;
  enabled: boolean;
}

export interface SiteBanner {
  id: string;
  preset: SiteBannerPreset | null;
  imageAssetId: string | null;
  imageUrl: string | null;
  script: LocalizedCopy;
  highlight: LocalizedCopy;
  joiner: LocalizedCopy;
  boxed: LocalizedCopy;
  description: LocalizedCopy;
  ctaLabel: LocalizedCopy;
  ctaTarget: SiteBannerTarget;
  ctaUrl: string;
}

export interface SiteBannerTheme {
  background: string;
  highlight: string;
  highlightText: string;
  box: string;
  boxText: string;
  script: string;
  text: string;
  button: string;
  buttonText: string;
}

export interface SiteIncludedItem {
  id: string;
  preset: SiteIncludedPreset | null;
  icon: SiteIncludedIcon;
  title: LocalizedCopy;
  text: LocalizedCopy;
  tag: LocalizedCopy;
}

export interface SiteReview {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface SiteReviewsContent {
  average: number | null;
  count: number;
  items: SiteReview[];
}

export interface SiteAppContent {
  iosUrl: string;
  androidUrl: string;
  title: LocalizedCopy;
  text: LocalizedCopy;
}

export interface SiteFaqItem {
  id: string;
  question: LocalizedCopy;
  answer: LocalizedCopy;
}

export interface SiteContactContent {
  whatsapp: string;
  hours: LocalizedCopy;
  payments: SitePaymentMethod[];
}

export interface SiteLogos {
  headerAssetId: string | null;
  headerUrl: string | null;
  companyAssetId: string | null;
  companyUrl: string | null;
}

export interface SiteLegalContent {
  privacy: LocalizedCopy;
  terms: LocalizedCopy;
}

export interface SiteContent {
  sections: SiteSectionConfig[];
  banners: SiteBanner[];
  bannerTheme: SiteBannerTheme;
  included: SiteIncludedItem[];
  reviews: SiteReviewsContent;
  app: SiteAppContent;
  faq: SiteFaqItem[];
  contact: SiteContactContent;
  brandColor: string;
  fontFamily: SiteFontFamily;
  cornerStyle: SiteCornerStyle;
  allowDifferentReturn: boolean;
  logos: SiteLogos;
  pageBackground: string;
  legal: SiteLegalContent;
  supportsSiteBranding: boolean;
  raw: Record<string, unknown>;
}
