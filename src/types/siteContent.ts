import type {
  SiteIncludedIcon,
  SiteIncludedPreset,
  SiteSectionId,
} from "@/enums";

export type LocalizedCopy = Record<string, string>;

export interface SiteSectionConfig {
  id: SiteSectionId;
  enabled: boolean;
}

export interface SiteBanner {
  id: string;
  imageUrl: string;
  title: LocalizedCopy;
  subtitle: LocalizedCopy;
  linkUrl: string;
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
  author: string;
  origin: string;
  date: string;
  rating: number;
  text: string;
  vehicle: string;
}

export interface SiteReviewsContent {
  score: number | null;
  count: number | null;
  sourceLabel: string;
  sourceUrl: string;
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
}

export interface SiteContent {
  sections: SiteSectionConfig[];
  banners: SiteBanner[];
  included: SiteIncludedItem[];
  reviews: SiteReviewsContent;
  app: SiteAppContent;
  faq: SiteFaqItem[];
  contact: SiteContactContent;
}
