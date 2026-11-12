import {
  SiteBannerPreset,
  SiteBannerTarget,
  SiteCornerStyle,
  SiteFontFamily,
  SiteIncludedIcon,
  SiteIncludedPreset,
  SitePaymentMethod,
  SiteSectionId,
} from "@/enums";
import type {
  LocalizedCopy,
  SiteAppContent,
  SiteBanner,
  SiteBannerTheme,
  SiteContent,
  SiteFaqItem,
  SiteIncludedItem,
  SiteLegalContent,
  SiteLogos,
  SiteReviewsContent,
  SiteSectionConfig,
} from "@/types/siteContent";

const SQUARE_CORNER_RADIUS = "none";
const DEFAULT_CORNER_RADIUS = "md";
const ROUND_CORNER_RADII = ["sm", "md", "lg"] as const;

export const SITE_SECTION_ORDER: SiteSectionId[] = [
  SiteSectionId.HERO,
  SiteSectionId.SEARCH,
  SiteSectionId.COMPANY,
  SiteSectionId.FLEET,
  SiteSectionId.INCLUDED,
  SiteSectionId.REVIEWS,
  SiteSectionId.APP,
  SiteSectionId.BRANCHES,
  SiteSectionId.EXTRAS,
  SiteSectionId.FAQ,
  SiteSectionId.CONTACT,
];

export const FIXED_SITE_SECTIONS: SiteSectionId[] = [SiteSectionId.FLEET];
export const HIDDEN_SITE_SECTIONS: SiteSectionId[] = [
  SiteSectionId.SEARCH,
  SiteSectionId.EXTRAS,
];
export const OPT_IN_SITE_SECTIONS: SiteSectionId[] = [
  SiteSectionId.INCLUDED,
  SiteSectionId.EXTRAS,
];

export const MAX_SITE_BANNERS = 3;
export const MAX_SITE_INCLUDED = 6;
export const MAX_SITE_FAQ = 20;
export const DEFAULT_BRAND_COLOR = "#0e7490";
export const DEFAULT_PAGE_BACKGROUND = "#ffffff";
export const MAX_LEGAL_TEXT = 20000;

export const DEFAULT_BANNER_THEME: SiteBannerTheme = {
  background: "#032d2e",
  highlight: "#e8a52c",
  highlightText: "#102018",
  box: "#f8f7f3",
  boxText: "#102018",
  script: "#e8a52c",
  text: "#ffffff",
  button: "#f8f7f3",
  buttonText: "#102018",
};

export interface BannerImages {
  mobile: string;
  desktop: string;
}

const BANNER_PRESET_DESKTOP_IMAGES: Record<SiteBannerPreset, string> = {
  [SiteBannerPreset.AIRPORT]: "/images/banners/site-airport-desktop.webp",
  [SiteBannerPreset.WEEKEND]: "/images/banners/site-weekend-desktop.webp",
  [SiteBannerPreset.ROADTRIP]: "/images/banners/site-roadtrip-desktop.webp",
};

export const BANNER_PRESET_IMAGES: Record<SiteBannerPreset, string> = {
  [SiteBannerPreset.AIRPORT]: "/images/banners/site-airport.webp",
  [SiteBannerPreset.WEEKEND]: "/images/banners/site-weekend.webp",
  [SiteBannerPreset.ROADTRIP]: "/images/banners/site-roadtrip.webp",
};

const INCLUDED_ICON_BY_PRESET: Record<SiteIncludedPreset, SiteIncludedIcon> = {
  [SiteIncludedPreset.INSURANCE]: SiteIncludedIcon.SHIELD,
  [SiteIncludedPreset.MILEAGE]: SiteIncludedIcon.GAUGE,
  [SiteIncludedPreset.FUEL]: SiteIncludedIcon.FUEL,
  [SiteIncludedPreset.CANCELLATION]: SiteIncludedIcon.CALENDAR_CHECK,
};

const HEX = /^#[0-9a-f]{6}$/i;

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

export function presetBanner(preset: SiteBannerPreset, id: string = preset): SiteBanner {
  return {
    id,
    preset,
    imageAssetId: null,
    imageUrl: null,
    script: {},
    highlight: {},
    joiner: {},
    boxed: {},
    description: {},
    ctaLabel: {},
    ctaTarget: SiteBannerTarget.FLEET,
    ctaUrl: "",
  };
}

export function emptyBanner(id: string): SiteBanner {
  return { ...presetBanner(SiteBannerPreset.ROADTRIP, id), preset: null };
}

export function defaultSiteContent(): SiteContent {
  return parseSiteContent(undefined, undefined);
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

function enumValue<T extends string>(values: readonly T[], value: unknown): T | null {
  return typeof value === "string" && values.includes(value as T) ? (value as T) : null;
}

export function isHexColor(value: string): boolean {
  return HEX.test(value);
}

function readColor(value: unknown, fallback: string): string {
  const color = readString(value);
  return isHexColor(color) ? color : fallback;
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

export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
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
  const sectionIds = Object.values(SiteSectionId);
  const rows = readList(value)
    .map((row, index) => ({ row, order: readNumber(row.order) ?? index }))
    .sort((left, right) => left.order - right.order);
  const sections: SiteSectionConfig[] = [];

  for (const { row } of rows) {
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
    if (seen.has(id)) {
      continue;
    }
    const rank = SITE_SECTION_ORDER.indexOf(id);
    let after = -1;
    sections.forEach((section, index) => {
      if (SITE_SECTION_ORDER.indexOf(section.id) < rank) {
        after = index;
      }
    });
    sections.splice(after + 1, 0, { id, enabled: !OPT_IN_SITE_SECTIONS.includes(id) });
  }

  return sections;
}

function parseBanners(value: unknown): SiteBanner[] {
  if (!Array.isArray(value)) {
    return Object.values(SiteBannerPreset).map((preset) => presetBanner(preset));
  }
  const presets = Object.values(SiteBannerPreset);
  const targets = Object.values(SiteBannerTarget);
  return readList(value)
    .map((row, index) => ({
      id: readString(row.id) || `banner-${index + 1}`,
      preset: enumValue(presets, row.preset),
      imageAssetId: readString(row.imageAssetId) || null,
      imageUrl: safeUrl(row.imageUrl) || null,
      script: readCopy(row.script),
      highlight: readCopy(row.highlight ?? row.title),
      joiner: readCopy(row.joiner),
      boxed: readCopy(row.boxed),
      description: readCopy(row.description ?? row.subtitle),
      ctaLabel: readCopy(row.ctaLabel),
      ctaTarget: enumValue(targets, row.ctaTarget) ?? SiteBannerTarget.FLEET,
      ctaUrl: safeUrl(row.ctaUrl ?? row.linkUrl),
    }))
    .slice(0, MAX_SITE_BANNERS);
}

function parseBannerTheme(value: unknown): SiteBannerTheme {
  const row = isRecord(value) ? value : {};
  const theme = { ...DEFAULT_BANNER_THEME };
  for (const key of Object.keys(theme) as (keyof SiteBannerTheme)[]) {
    theme[key] = readColor(row[key], theme[key]);
  }
  return theme;
}

function parseIncluded(value: unknown): SiteIncludedItem[] {
  if (!Array.isArray(value)) {
    return Object.values(SiteIncludedPreset).map(presetIncludedItem);
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
  const items = readList(row.items)
    .map((item, index) => ({
      id: readString(item.id) || `review-${index + 1}`,
      rating: clampRating(readNumber(item.rating)),
      text: readString(item.text ?? item.body),
      createdAt: readString(item.createdAt),
    }))
    .filter((item) => item.text);
  const average = readNumber(row.average);
  return {
    average: average !== null && average > 0 && average <= 5 ? average : null,
    count: Math.max(readNumber(row.count) ?? 0, items.length),
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

function parseFaq(sections: unknown): SiteFaqItem[] {
  const faq = readList(sections).find((row) => row.id === SiteSectionId.FAQ);
  const content = faq && isRecord(faq.content) ? faq.content : {};
  return readList(content.items)
    .map((row, index) => ({
      id: readString(row.id) || `faq-${index + 1}`,
      question: readCopy(row.question),
      answer: readCopy(row.answer),
    }))
    .filter(
      (item) =>
        Object.keys(item.question).length > 0 && Object.keys(item.answer).length > 0,
    )
    .slice(0, MAX_SITE_FAQ);
}

function parseLogos(value: unknown): SiteLogos {
  const logos = isRecord(value) ? value : {};
  return {
    headerAssetId: readString(logos.headerAssetId) || null,
    headerUrl: readString(logos.headerUrl) || null,
    companyAssetId: readString(logos.companyAssetId) || null,
    companyUrl: readString(logos.companyUrl) || null,
  };
}

function parseLegal(value: unknown): SiteLegalContent {
  const legal = isRecord(value) ? value : {};
  return { privacy: readCopy(legal.privacy), terms: readCopy(legal.terms) };
}

export function parseSiteContent(appearanceRaw: unknown, reviewsRaw: unknown): SiteContent {
  const raw = isRecord(appearanceRaw) ? appearanceRaw : {};
  const contact = isRecord(raw.contact) ? raw.contact : {};
  const theme = isRecord(raw.theme) ? raw.theme : {};
  const payments: unknown[] = Array.isArray(contact.payments) ? contact.payments : [];

  return {
    sections: parseSections(raw.sections),
    banners: parseBanners(raw.banners),
    bannerTheme: parseBannerTheme(raw.bannerTheme),
    included: parseIncluded(raw.included),
    reviews: parseReviews(reviewsRaw),
    app: parseApp(raw.app),
    faq: parseFaq(raw.sections),
    contact: {
      whatsapp: readString(contact.whatsapp).replace(/[^\d+]/g, ""),
      hours: readCopy(contact.hours),
      payments: Object.values(SitePaymentMethod).filter((method) =>
        payments.includes(method),
      ),
    },
    brandColor: readColor(theme.primaryColor, ""),
    fontFamily: enumValue(Object.values(SiteFontFamily), theme.fontFamily) ?? SiteFontFamily.SANS,
    cornerStyle:
      theme.cornerRadius === SQUARE_CORNER_RADIUS ? SiteCornerStyle.SQUARE : SiteCornerStyle.ROUND,
    allowDifferentReturn: raw.allowDifferentReturn === true,
    logos: parseLogos(raw.logos),
    pageBackground: readColor(raw.pageBackground, DEFAULT_PAGE_BACKGROUND),
    legal: parseLegal(raw.legal),
    supportsSiteBranding: typeof raw.pageBackground === "string",
    raw,
  };
}

function nullable(value: string): string | null {
  return value.trim() ? value.trim() : null;
}

function whatsappNumber(value: string): string | null {
  const digits = value.replace(/[^\d+]/g, "");
  return /^\+?\d{8,15}$/.test(digits) ? digits : null;
}

function serializeCornerRadius(style: SiteCornerStyle, current: unknown): string {
  if (style === SiteCornerStyle.SQUARE) return SQUARE_CORNER_RADIUS;
  const radius = enumValue(ROUND_CORNER_RADII, current);
  return radius ?? DEFAULT_CORNER_RADIUS;
}

export function serializeAppearance(content: SiteContent): Record<string, unknown> {
  const raw = content.raw;
  const rawSections = readList(raw.sections);
  const theme = isRecord(raw.theme) ? raw.theme : {};
  const brand = isHexColor(content.brandColor)
    ? content.brandColor
    : readColor(theme.primaryColor, DEFAULT_BRAND_COLOR);
  const hero = isRecord(raw.hero) ? raw.hero : {};

  return {
    hero: {
      title: readCopy(hero.title),
      subtitle: readCopy(hero.subtitle),
      imageAssetId: readString(hero.imageAssetId) || null,
    },
    template: "classic",
    theme: {
      primaryColor: brand,
      accentColor: brand,
      fontFamily: content.fontFamily,
      cornerRadius: serializeCornerRadius(content.cornerStyle, theme.cornerRadius),
    },
    sections: content.sections.map((section, order) => {
      const existing = rawSections.find((row) => row.id === section.id);
      const items =
        section.id === SiteSectionId.FAQ
          ? content.faq.map((item) => ({ question: item.question, answer: item.answer }))
          : readList(existing && isRecord(existing.content) ? existing.content.items : []);
      return { id: section.id, enabled: section.enabled, order, content: { items } };
    }),
    banners: content.banners.map((banner) => ({
      id: banner.id,
      preset: banner.preset,
      imageAssetId: banner.imageAssetId,
      script: banner.script,
      highlight: banner.highlight,
      joiner: banner.joiner,
      boxed: banner.boxed,
      description: banner.description,
      ctaLabel: banner.ctaLabel,
      ctaTarget: banner.ctaTarget,
      ctaUrl: banner.ctaTarget === SiteBannerTarget.URL ? nullable(banner.ctaUrl) : null,
    })),
    bannerTheme: content.bannerTheme,
    included: content.included,
    app: {
      iosUrl: nullable(content.app.iosUrl),
      androidUrl: nullable(content.app.androidUrl),
      title: content.app.title,
      text: content.app.text,
    },
    contact: {
      whatsapp: whatsappNumber(content.contact.whatsapp),
      hours: content.contact.hours,
      payments: content.contact.payments,
    },
    allowDifferentReturn: content.allowDifferentReturn,
    ...(content.supportsSiteBranding
      ? {
          logos: {
            headerAssetId: content.logos.headerAssetId,
            companyAssetId: content.logos.companyAssetId,
          },
          pageBackground: isHexColor(content.pageBackground)
            ? content.pageBackground
            : DEFAULT_PAGE_BACKGROUND,
          legal: content.legal,
        }
      : {}),
  };
}

export function siteHeaderLogo(content: SiteContent, companyLogo: string | null): string | null {
  return content.logos.headerUrl || companyLogo;
}

export function siteCompanyLogo(content: SiteContent, companyLogo: string | null): string | null {
  return content.logos.companyUrl || companyLogo;
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
    case SiteSectionId.BRANCHES:
      return facts.branchCount > 0;
    case SiteSectionId.FAQ:
      return content.faq.length > 0;
    case SiteSectionId.CONTACT:
      return Boolean(content.contact.whatsapp) || facts.hasPhone || facts.hasEmail;
    case SiteSectionId.EXTRAS:
      return false;
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

export function editableSections(sections: SiteSectionConfig[]): SiteSectionConfig[] {
  return sections.filter((section) => !HIDDEN_SITE_SECTIONS.includes(section.id));
}

export function moveSection(
  sections: SiteSectionConfig[],
  id: SiteSectionId,
  direction: -1 | 1,
): SiteSectionConfig[] {
  const editable = editableSections(sections);
  const index = editable.findIndex((section) => section.id === id);
  const target = editable[index + direction];
  if (index < 0 || !target) {
    return sections;
  }
  const from = sections.findIndex((section) => section.id === id);
  const to = sections.findIndex((section) => section.id === target.id);
  const next = [...sections];
  const moved = next[from];
  const swapped = next[to];
  if (!moved || !swapped) {
    return sections;
  }
  next[from] = swapped;
  next[to] = moved;
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

export function siteAppLinks(app: SiteAppContent): { iosUrl: string; androidUrl: string } {
  return { iosUrl: app.iosUrl || "", androidUrl: app.androidUrl || "" };
}

/** The get-the-app section only shows when the company set a store link. */
export function hasSiteAppLinks(app: SiteAppContent): boolean {
  const links = siteAppLinks(app);
  return Boolean(links.iosUrl || links.androidUrl);
}

export function appQrTarget(app: SiteAppContent): string {
  const links = siteAppLinks(app);
  return links.androidUrl || links.iosUrl;
}

export function bannerImages(banner: SiteBanner): BannerImages | null {
  if (banner.imageUrl) {
    return { mobile: banner.imageUrl, desktop: banner.imageUrl };
  }
  if (!banner.preset) {
    return null;
  }
  const mobile = BANNER_PRESET_IMAGES[banner.preset];
  return { mobile, desktop: BANNER_PRESET_DESKTOP_IMAGES[banner.preset] };
}

function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const channel = (start: number) => {
    const scaled = Number.parseInt(value.slice(start, start + 2), 16) / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

export function contrastWithWhite(hex: string): number {
  if (!isHexColor(hex)) {
    return 0;
  }
  return 1.05 / (relativeLuminance(hex) + 0.05);
}

export function newContentId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`.toLowerCase();
}

const SITE_FONT_VARIABLES: Record<SiteFontFamily, string> = {
  [SiteFontFamily.SANS]: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  [SiteFontFamily.SERIF]: "var(--font-lora), ui-serif, Georgia, serif",
  [SiteFontFamily.DISPLAY]: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif",
};

export function siteFontStack(family: SiteFontFamily): string {
  return SITE_FONT_VARIABLES[family];
}

export function withBrandColor(content: SiteContent, brandColor: string): SiteContent {
  return {
    ...content,
    brandColor,
    bannerTheme: isHexColor(brandColor)
      ? { ...content.bannerTheme, background: brandColor }
      : content.bannerTheme,
  };
}
