"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Car,
  ChevronRight,
  CircleHelp,
  Building2,
  GalleryHorizontal,
  ListChecks,
  LogOut,
  MapPin,
  MessageCircle,
  Smartphone,
  Star,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { SiteSectionId, SiteStatus } from "@/enums";
import { routing } from "@/i18n/routing";
import {
  FIXED_SITE_SECTIONS,
  editableSections,
  moveSection,
  sectionHasContent,
  type SiteContentFacts,
} from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/types/siteContent";
import type { WebsiteSettings } from "@/types/websiteSettings";
import { AppForm } from "./AppForm";
import { BannersForm } from "./BannersForm";
import { CompanyForm } from "./CompanyForm";
import { ContactForm } from "./ContactForm";
import { DesignForm } from "./DesignForm";
import { FaqForm } from "./FaqForm";
import { IncludedForm } from "./IncludedForm";
import { ReviewsForm } from "./ReviewsForm";
import { SettingsForm } from "./SettingsForm";

const SECTION_ICONS: Record<SiteSectionId, LucideIcon> = {
  [SiteSectionId.HERO]: GalleryHorizontal,
  [SiteSectionId.SEARCH]: GalleryHorizontal,
  [SiteSectionId.EXTRAS]: ListChecks,
  [SiteSectionId.COMPANY]: Building2,
  [SiteSectionId.FLEET]: Car,
  [SiteSectionId.INCLUDED]: ListChecks,
  [SiteSectionId.REVIEWS]: Star,
  [SiteSectionId.APP]: Smartphone,
  [SiteSectionId.BRANCHES]: MapPin,
  [SiteSectionId.FAQ]: CircleHelp,
  [SiteSectionId.CONTACT]: MessageCircle,
};

const EDITABLE_SECTIONS: SiteSectionId[] = [
  SiteSectionId.HERO,
  SiteSectionId.COMPANY,
  SiteSectionId.INCLUDED,
  SiteSectionId.REVIEWS,
  SiteSectionId.APP,
  SiteSectionId.FAQ,
  SiteSectionId.CONTACT,
];

const STATUS_BADGE: Record<SiteStatus, "success" | "warning" | "default"> = {
  [SiteStatus.PUBLISHED]: "success",
  [SiteStatus.PAUSED]: "warning",
  [SiteStatus.DRAFT]: "default",
};

interface SiteEditorProps {
  draft: WebsiteSettings;
  companyName: string;
  facts: SiteContentFacts;
  dirty: boolean;
  saving: boolean;
  error?: string | null;
  onChange: (next: WebsiteSettings) => void;
  onSave: () => void;
  onDiscard: () => void;
  onPublish: () => void;
  onPause: () => void;
  publishing: boolean;
  fallbackColor: string;
  onSignOut: () => void;
}

export function SiteEditor({
  draft,
  companyName,
  facts,
  dirty,
  saving,
  error,
  onChange,
  onSave,
  onDiscard,
  onPublish,
  onPause,
  publishing,
  fallbackColor,
  onSignOut,
}: SiteEditorProps) {
  const t = useTranslations("siteEditor");
  const uiLocale = useLocale();
  const [tab, setTab] = useState("sections");
  const [openSection, setOpenSection] = useState<SiteSectionId | null>(null);
  const [locale, setLocale] = useState(uiLocale);
  const content = draft.content;
  const setContent = (patch: Partial<SiteContent>) =>
    onChange({ ...draft, content: { ...content, ...patch } });

  function summary(id: SiteSectionId): string {
    switch (id) {
      case SiteSectionId.HERO:
        return content.banners.length
          ? t("summary.banners", { count: content.banners.length })
          : t("summary.bannersEmpty");
      case SiteSectionId.COMPANY:
        return t("summary.company");
      case SiteSectionId.FLEET:
        return t("summary.fleet");
      case SiteSectionId.INCLUDED:
        return t("summary.included", { count: content.included.length });
      case SiteSectionId.REVIEWS:
        return t("summary.reviews", { count: content.reviews.items.length });
      case SiteSectionId.APP:
        return t("summary.app");
      case SiteSectionId.BRANCHES:
        return t("summary.locations", { count: facts.branchCount });
      case SiteSectionId.FAQ:
        return t("summary.faq", { count: content.faq.length });
      case SiteSectionId.CONTACT:
        return content.contact.whatsapp ? t("summary.contactWhatsapp") : t("summary.contact");
      default:
        return "";
    }
  }

  function sectionForm(id: SiteSectionId) {
    switch (id) {
      case SiteSectionId.HERO:
        return (
          <BannersForm
            banners={content.banners}
            theme={content.bannerTheme}
            locale={locale}
            onChange={(banners) => setContent({ banners })}
            onThemeChange={(bannerTheme) => setContent({ bannerTheme })}
          />
        );
      case SiteSectionId.COMPANY:
        return (
          <CompanyForm draft={draft} locale={locale} companyName={companyName} onChange={onChange} />
        );
      case SiteSectionId.INCLUDED:
        return (
          <IncludedForm
            items={content.included}
            locale={locale}
            onChange={(included) => setContent({ included })}
          />
        );
      case SiteSectionId.REVIEWS:
        return <ReviewsForm reviews={content.reviews} />;
      case SiteSectionId.APP:
        return <AppForm app={content.app} locale={locale} onChange={(app) => setContent({ app })} />;
      case SiteSectionId.FAQ:
        return <FaqForm items={content.faq} locale={locale} onChange={(faq) => setContent({ faq })} />;
      case SiteSectionId.CONTACT:
        return (
          <ContactForm
            contact={content.contact}
            locale={locale}
            onChange={(contact) => setContent({ contact })}
          />
        );
      default:
        return null;
    }
  }

  const iconButton =
    "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30";
  const showLocale = tab === "sections" && openSection !== null;

  return (
    <aside
      aria-label={t("aria")}
      className="flex w-full flex-col border-b border-border bg-surface-muted lg:sticky lg:top-16 lg:z-30 lg:h-[calc(100dvh-4rem)] lg:w-[34rem] lg:border-b-0 lg:border-l"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{t("title")}</p>
            <Badge variant={STATUS_BADGE[draft.status]} dot>
              {t(`status.${draft.status}`)}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">{companyName}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onSignOut}>
          <LogOut size={14} aria-hidden />
          {t("signOut")}
        </Button>
      </div>

      <Tabs.Root
        value={tab}
        onValueChange={(value) => {
          setTab(value);
          setOpenSection(null);
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <Tabs.List
          aria-label={t("tabsAria")}
          className="flex gap-4 border-b border-border bg-surface px-4"
        >
          {["sections", "design", "settings"].map((value) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className="-mb-px cursor-pointer border-b-2 border-transparent py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              {t(`tabs.${value}`)}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {showLocale ? (
          <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2">
            <span className="text-xs text-muted-foreground">{t("contentLanguage")}</span>
            <div className="flex gap-1 rounded-md bg-surface-muted p-0.5" role="radiogroup" aria-label={t("contentLanguage")}>
              {routing.locales.map((code) => (
                <button
                  key={code}
                  type="button"
                  role="radio"
                  aria-checked={locale === code}
                  onClick={() => setLocale(code)}
                  className={cn(
                    "cursor-pointer rounded px-2 py-0.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    locale === code
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`locales.${code}`)}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Tabs.Content value="sections" className="flex flex-col gap-3 p-4 focus-visible:outline-none">
            {openSection ? (
              <>
                <button
                  type="button"
                  onClick={() => setOpenSection(null)}
                  className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ArrowLeft size={14} aria-hidden />
                  {t("backToSections")}
                </button>
                <h2 className="text-base font-semibold text-foreground">
                  {t(`sections.${openSection}`)}
                </h2>
                {sectionForm(openSection)}
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">{t("sectionsHint")}</p>
                <ol className="flex flex-col gap-2">
                  {editableSections(content.sections).map((section, index, list) => {
                    const Icon = SECTION_ICONS[section.id];
                    const fixed = FIXED_SITE_SECTIONS.includes(section.id);
                    const editable = EDITABLE_SECTIONS.includes(section.id);
                    const label = t(`sections.${section.id}`);
                    const hiddenForNow =
                      section.enabled && !sectionHasContent(section.id, content, facts);
                    return (
                      <li
                        key={section.id}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border border-border bg-surface p-3",
                          !section.enabled && "opacity-60",
                        )}
                      >
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Icon size={16} aria-hidden />
                        </span>
                        <button
                          type="button"
                          disabled={!editable}
                          onClick={() => setOpenSection(section.id)}
                          className="min-w-0 flex-1 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
                        >
                          <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                            {label}
                            {editable ? (
                              <ChevronRight size={14} className="text-muted-foreground" aria-hidden />
                            ) : null}
                          </span>
                          <span className={cn("block truncate text-xs", hiddenForNow ? "text-warning" : "text-muted-foreground")}>
                            {hiddenForNow ? t("hiddenUntilContent") : summary(section.id)}
                          </span>
                        </button>
                        <div className="flex shrink-0 items-center">
                          <button
                            type="button"
                            className={iconButton}
                            disabled={index === 0}
                            onClick={() => setContent({ sections: moveSection(content.sections, section.id, -1) })}
                            aria-label={t("common.moveUp", { item: label })}
                          >
                            <ArrowUp size={14} aria-hidden />
                          </button>
                          <button
                            type="button"
                            className={iconButton}
                            disabled={index === list.length - 1}
                            onClick={() => setContent({ sections: moveSection(content.sections, section.id, 1) })}
                            aria-label={t("common.moveDown", { item: label })}
                          >
                            <ArrowDown size={14} aria-hidden />
                          </button>
                        </div>
                        <Switch
                          checked={section.enabled}
                          disabled={fixed}
                          aria-label={t("common.show", { item: label })}
                          onCheckedChange={(enabled) =>
                            setContent({
                              sections: content.sections.map((item) =>
                                item.id === section.id ? { ...item, enabled } : item,
                              ),
                            })
                          }
                        />
                      </li>
                    );
                  })}
                </ol>
                <p className="text-xs text-muted-foreground">{t("orderHint")}</p>
              </>
            )}
          </Tabs.Content>
          <Tabs.Content value="design" className="flex flex-col gap-3 p-4 focus-visible:outline-none">
            <DesignForm draft={draft} fallbackColor={fallbackColor} onChange={onChange} />
          </Tabs.Content>
          <Tabs.Content value="settings" className="flex flex-col gap-3 p-4 focus-visible:outline-none">
            <SettingsForm draft={draft} onChange={onChange} />
          </Tabs.Content>
        </div>
      </Tabs.Root>

      <div className="flex flex-col gap-2 border-t border-border bg-surface px-4 py-3">
        {error ? (
          <p className="text-xs text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {dirty
              ? t("unsaved")
              : draft.hasUnpublishedChanges
                ? t("savedNotPublished")
                : t("saved")}
          </p>
          <div className="flex gap-2">
            {dirty ? (
              <>
                <Button type="button" variant="secondary" size="sm" disabled={saving} onClick={onDiscard}>
                  {t("discard")}
                </Button>
                <Button type="button" size="sm" isLoading={saving} onClick={onSave}>
                  {t("save")}
                </Button>
              </>
            ) : (
              <>
                {draft.status === SiteStatus.PUBLISHED ? (
                  <Button type="button" variant="secondary" size="sm" disabled={publishing} onClick={onPause}>
                    {t("pause")}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  isLoading={publishing}
                  disabled={
                    !draft.canPublish ||
                    (draft.status === SiteStatus.PUBLISHED && !draft.hasUnpublishedChanges)
                  }
                  onClick={onPublish}
                >
                  {t("publish")}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
