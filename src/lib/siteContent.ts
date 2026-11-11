import {
  SiteIncludedIcon,
  SitePaymentMethod,
  SiteIncludedPreset,
  SiteSectionId,
} from "@/enums";
import type {
  LocalizedCopy,
  SiteAppContent,
  SiteBanner,
  SiteContent,
  SiteFaqItem,
  SiteIncludedItem,
  SiteReview,
  SiteReviewsContent,
  SiteSectionConfig,
} from "@/types/siteContent";

export const SITE_SECTION_ORDER: SiteSectionId[] = [
  SiteSectionId.BANNERS,
  SiteSectionId.COMPANY,
  SiteSectionId.FLEET,
  SiteSectionId.INCLUDED,
  SiteSectionId.REVIEWS,
  SiteSectionId.APP,
  SiteSectionId.LOCATIONS,
  SiteSectionId.FAQ,
  SiteSectionId.CONTACT,
];

export const FIXED_SITE_SECTIONS: SiteSectionId[] = [SiteSectionId.FLEET];

export const OPT_IN_SITE_SECTIONS: SiteSectionId[] = [SiteSectionId.INCLUDED];

export const MAX_SITE_BANNERS = 3;
export const MAX_SITE_INCLUDED = 6;
export const MAX_SITE_REVIEWS = 6;
export const MAX_SITE_FAQ = 12;

const INCLUDED_ICON_BY_PRESET: Record<SiteIncludedPreset, SiteIncludedIcon> = {
  [SiteIncludedPreset.INSURANCE]: SiteIncludedIcon.SHIELD,
  [SiteIncludedPreset.MILEAGE]: SiteIncludedIcon.GAUGE,
  [SiteIncludedPreset.FUEL]: SiteIncludedIcon.FUEL,
  [SiteIncludedPreset.CANCELLATION]: SiteIncludedIcon.CALENDAR_CHECK,
};

export function presetIncludedItem(preset: SiteIncludedPreset): SiteIncludedItem {
  return {
    id: preset,
    preset,
    icon: INCLUDED_ICON_BY_PRESET[preset],
    title: {},
    text: {},
    tag: {},
  };
}

export function defaultSiteContent(): SiteContent {
  return {
    sections: SITE_SECTION_ORDER.map((id) => ({
      id,
      enabled: !OPT_IN_SITE_SECTIONS.includes(id),
    })),
    banners: [],
    included: Object.values(SiteIncludedPreset).map(presetIncludedItem),
    reviews: {
      score: null,
      count: null,
      sourceLabel: "",
      sourceUrl: "",
      items: [],
    },
    app: { iosUrl: "", androidUrl: "", title: {}, text: {} },
    faq: [],
    contact: { whatsapp: "", hours: {}, payments: [] },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readCopy(value: unknown): LocalizedCopy {
  if (typeof value === "string") {
    return value.trim() ? { "en-GB": value.trim() } : {};
  }
  if (!isRecord(value)) {
    return {};
  }
  const copy: LocalizedCopy = {};
  for (const [locale, text] of Object.entries(value)) {
    if (typeof text === "string" && text.trim()) {
      copy[locale] = text;
    }
  }
  return copy;
}

function readList(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function enumValue<T extends string>(
  values: readonly T[],
  value: unknown,
): T | null {
  return typeof value === "string" && values.includes(value as T)
    ? (value as T)
    : null;
}

export function isSafeUrl(value: string): boolean {
  if (!value) {
    return false;
  }
  if (value.startsWith("/") && !value.startsWith("//")) {
    return true;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function safeUrl(value: unknown): string {
  const url = readString(value);
  return isSafeUrl(url) ? url : "";
}

function parseSections(value: unknown): SiteSectionConfig[] {
  const seen = new Set<SiteSectionId>();
  const sections: SiteSectionConfig[] = [];
  const sectionIds = Object.values(SiteSectionId);

  for (const row of readList(value)) {
    const id = enumValue(sectionIds, row.id);
    if (!id || seen.has(id)) {
      continue;
    }
    seen.add(id);
    sections.push({
      id,
      enabled: FIXED_SITE_SECTIONS.includes(id) ? true : row.enabled !== false,
    });
  }

  for (const id of SITE_SECTION_ORDER) {
    if (!seen.has(id)) {
      sections.push({ id, enabled: !OPT_IN_SITE_SECTIONS.includes(id) });
    }
  }

  return sections;
}

function parseBanners(value: unknown): SiteBanner[] {
  return readList(value)
    .map((row, index) => ({
      id: readString(row.id) || `banner-${index + 1}`,
      imageUrl: safeUrl(row.imageUrl),
      title: readCopy(row.title),
      subtitle: readCopy(row.subtitle),
      linkUrl: safeUrl(row.linkUrl),
    }))
    .slice(0, MAX_SITE_BANNERS);
}

function parseIncluded(value: unknown): SiteIncludedItem[] {
  if (!Array.isArray(value)) {
    return defaultSiteContent().included;
  }
  const icons = Object.values(SiteIncludedIcon);
  const presets = Object.values(SiteIncludedPreset);

  return readList(value)
    .map((row, index) => {
      const preset = enumValue(presets, row.preset);
      return {
        id: readString(row.id) || preset || `included-${index + 1}`,
        preset,
        icon:
          enumValue(icons, row.icon) ??
          (preset ? INCLUDED_ICON_BY_PRESET[preset] : SiteIncludedIcon.CHECK),
        title: readCopy(row.title),
        text: readCopy(row.text),
        tag: readCopy(row.tag),
      };
    })
    .slice(0, MAX_SITE_INCLUDED);
}

function clampRating(value: number | null): number {
  if (value === null) {
    return 5;
  }
  return Math.min(5, Math.max(1, Math.round(value)));
}

function parseReviews(value: unknown): SiteReviewsContent {
  const row = isRecord(value) ? value : {};
  const score = readNumber(row.score);
  const count = readNumber(row.count);
  const items: SiteReview[] = readList(row.items)
    .map((item, index) => ({
      id: readString(item.id) || `review-${index + 1}`,
      author: readString(item.author),
      origin: readString(item.origin),
      date: readString(item.date),
      rating: clampRating(readNumber(item.rating)),
      text: readString(item.text),
      vehicle: readString(item.vehicle),
    }))
    .filter((item) => item.author && item.text)
    .slice(0, MAX_SITE_REVIEWS);

  return {
    score: score !== null && score > 0 && score <= 5 ? score : null,
    count: count !== null && count > 0 ? Math.round(count) : null,
    sourceLabel: readString(row.sourceLabel),
    sourceUrl: safeUrl(row.sourceUrl),
    items,
  };
}

function parseApp(value: unknown): SiteAppContent {
  const row = isRecord(value) ? value : {};
  return {
    iosUrl: safeUrl(row.iosUrl),
    androidUrl: safeUrl(row.androidUrl),
    title: readCopy(row.title),
    text: readCopy(row.text),
  };
}

function parseFaq(value: unknown): SiteFaqItem[] {
  return readList(value)
    .map((row, index) => ({
      id: readString(row.id) || `faq-${index + 1}`,
      question: readCopy(row.question),
      answer: readCopy(row.answer),
    }))
    .filter(
      (item) =>
        Object.keys(item.question).length > 0 &&
        Object.keys(item.answer).length > 0,
    )
    .slice(0, MAX_SITE_FAQ);
}

export function parseSiteContent(raw: unknown): SiteContent {
  if (!isRecord(raw)) {
    return defaultSiteContent();
  }
  const contact = isRecord(raw.contact) ? raw.contact : {};

  return {
    sections: parseSections(raw.sections),
    banners: parseBanners(raw.banners),
    included: parseIncluded(raw.included),
    reviews: parseReviews(raw.reviews),
    app: parseApp(raw.app),
    faq: parseFaq(raw.faq),
    contact: {
      whatsapp: readString(contact.whatsapp).replace(/[^\d+]/g, ""),
      hours: readCopy(contact.hours),
      payments: Array.isArray(contact.payments)
        ? Object.values(SitePaymentMethod).filter((method) =>
            (contact.payments as unknown[]).includes(method),
          )
        : [],
    },
  };
}

export interface SiteContentFacts {
  branchCount: number;
  hasPhone: boolean;
  hasEmail: boolean;
}

export function sectionHasContent(
  id: SiteSectionId,
  content: SiteContent,
  facts: SiteContentFacts,
): boolean {
  switch (id) {
    case SiteSectionId.INCLUDED:
      return content.included.length > 0;
    case SiteSectionId.REVIEWS:
      return content.reviews.items.length > 0;
    case SiteSectionId.APP:
      return Boolean(content.app.iosUrl || content.app.androidUrl);
    case SiteSectionId.LOCATIONS:
      return facts.branchCount > 0;
    case SiteSectionId.FAQ:
      return content.faq.length > 0;
    case SiteSectionId.CONTACT:
      return Boolean(content.contact.whatsapp) || facts.hasPhone || facts.hasEmail;
    default:
      return true;
  }
}

export function visibleSections(
  content: SiteContent,
  facts: SiteContentFacts,
): SiteSectionId[] {
  return content.sections
    .filter((section) => section.enabled)
    .map((section) => section.id)
    .filter((id) => sectionHasContent(id, content, facts));
}

export function moveSection(
  sections: SiteSectionConfig[],
  id: SiteSectionId,
  direction: -1 | 1,
): SiteSectionConfig[] {
  const index = sections.findIndex((section) => section.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= sections.length) {
    return sections;
  }
  const next = [...sections];
  const [moved] = next.splice(index, 1);
  if (moved) {
    next.splice(target, 0, moved);
  }
  return next;
}

export function whatsappHref(number: string, message = ""): string | null {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 8) {
    return null;
  }
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}

export function appQrTarget(app: SiteAppContent): string {
  return app.androidUrl || app.iosUrl;
}

export function newContentId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}
