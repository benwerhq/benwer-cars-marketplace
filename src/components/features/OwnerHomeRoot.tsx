"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { DehydratedState } from "@tanstack/react-query";
import { EditorPreviewBar } from "@/components/features/site-editor/EditorPreviewBar";
import { SiteEditor } from "@/components/features/site-editor/SiteEditor";
import { SiteHomeLayouts } from "@/components/features/SiteHomeLayouts";
import { useSiteDraftLogo } from "@/context/SiteDraftLogoProvider";
import { useStaffAuth } from "@/context/StaffAuthProvider";
import { EditorView } from "@/enums";
import {
  usePauseWebsite,
  usePublishWebsite,
  useSaveWebsiteSettings,
  useWebsiteSettings,
} from "@/hooks/useWebsiteSettings";
import { getErrorKey } from "@/lib/errors";
import { localizedText } from "@/lib/localizedCopy";
import { siteFontStack, siteHeaderLogo } from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import {
  applyWebsiteDraft,
  settingsFromSite,
  siteBrandColor,
  toWebsitePatch,
  websiteDraftDirty,
} from "@/lib/websiteDraft";
import type { PublicSite } from "@/types/site";
import type { WebsiteSettings } from "@/types/websiteSettings";

interface OwnerHomeRootProps {
  site: PublicSite;
  companySlug: string;
  homeHref: string;
  preview?: string;
  from: string;
  to: string;
  branch: string;
  returnBranch?: string;
  dehydratedState: DehydratedState;
}

export function OwnerHomeRoot({
  site,
  companySlug,
  homeHref,
  preview,
  from,
  to,
  branch,
  returnBranch,
  dehydratedState,
}: OwnerHomeRootProps) {
  const locale = useLocale();
  const tSite = useTranslations("site");
  const tRoot = useTranslations();
  const router = useRouter();
  const { user, signOut } = useStaffAuth();
  const settings = useWebsiteSettings();
  const save = useSaveWebsiteSettings();
  const publish = usePublishWebsite();
  const pause = usePauseWebsite();
  const baseline = useMemo(
    () => settings.data ?? settingsFromSite(site),
    [settings.data, site],
  );
  const [override, setOverride] = useState<WebsiteSettings | null>(null);
  const draft = override ?? baseline;
  const [view, setView] = useState(EditorView.SPLIT);

  const canEdit = Boolean(user && settings.data?.canEdit);
  const liveSite = canEdit ? applyWebsiteDraft(site, draft) : site;
  const draftLogo = useSiteDraftLogo();
  const setHeaderLogo = draftLogo?.setHeaderLogo;
  const headerLogo = canEdit
    ? siteHeaderLogo(liveSite.content, site.company.branding.logoUrl)
    : undefined;
  const copy = {
    headline:
      localizedText(liveSite.headline, locale) ||
      tSite("defaultHeadline", { name: liveSite.company.name }),
    intro:
      localizedText(liveSite.intro, locale) ||
      liveSite.company.description ||
      "",
    phone: liveSite.showPhone ? liveSite.company.phone : null,
    email: liveSite.showEmail ? liveSite.company.email : null,
    address: liveSite.showAddress
      ? liveSite.company.address || liveSite.company.location
      : null,
    whatsapp: liveSite.content.contact.whatsapp || null,
    rating:
      liveSite.content.reviews.average && liveSite.content.reviews.count
        ? {
            score: liveSite.content.reviews.average,
            count: liveSite.content.reviews.count,
          }
        : null,
  };
  const dirty = canEdit && websiteDraftDirty(baseline, draft);
  const brandColor = siteBrandColor(liveSite);
  const style = {
    "--background": liveSite.content.pageBackground,
    ...(brandColor ? { "--primary": brandColor } : {}),
    fontFamily: siteFontStack(liveSite.content.fontFamily),
  } as CSSProperties;
  const setThemeStyle = draftLogo?.setThemeStyle;
  const brand = canEdit ? brandColor : null;
  const font = canEdit ? liveSite.content.fontFamily : null;
  useEffect(() => {
    setHeaderLogo?.(headerLogo);
  }, [setHeaderLogo, headerLogo]);
  useEffect(() => {
    setThemeStyle?.(
      font
        ? ({
            ...(brand ? { "--primary": brand } : {}),
            fontFamily: siteFontStack(font),
          } as CSSProperties)
        : undefined,
    );
  }, [setThemeStyle, brand, font]);
  const mutationError = save.error ?? publish.error ?? pause.error;
  const errorMessage = mutationError ? tRoot(getErrorKey(mutationError)) : null;
  const saveDraft = () => {
    void save.mutateAsync(toWebsitePatch(draft)).then(() => {
      setOverride(null);
      router.refresh();
    });
  };
  const publishDraft = () => {
    void publish.mutateAsync(undefined);
  };
  const showPreview = !canEdit || view !== EditorView.FULLSCREEN;
  const showEditor = canEdit && view !== EditorView.PREVIEW;

  return (
    <div
      style={style}
      className={cn(
        "bg-background",
        showEditor && showPreview && "lg:grid lg:grid-cols-[minmax(0,1fr)_34rem]",
        canEdit && view === EditorView.PREVIEW && "pb-36 sm:pb-24",
      )}
    >
      <div className={cn(!showPreview && "hidden")}>
        <SiteHomeLayouts
          site={liveSite}
          copy={copy}
          companySlug={companySlug}
          homeHref={homeHref}
          preview={preview}
          from={from}
          to={to}
          branch={branch}
          returnBranch={returnBranch}
          dehydratedState={dehydratedState}
        />
      </div>
      {canEdit && view === EditorView.PREVIEW ? (
        <EditorPreviewBar
          draft={draft}
          dirty={dirty}
          saving={save.isPending}
          publishing={publish.isPending}
          error={errorMessage}
          onEdit={() => setView(EditorView.SPLIT)}
          onSave={saveDraft}
          onPublish={publishDraft}
        />
      ) : null}
      {showEditor ? (
        <SiteEditor
          draft={draft}
          companyId={site.company.id}
          companyName={liveSite.company.name}
          companyDescription={liveSite.company.description ?? ""}
          companyLogo={site.company.branding.logoUrl}
          facts={{
            branchCount: liveSite.branches.length,
            hasPhone: Boolean(copy.phone),
            hasEmail: Boolean(copy.email),
          }}
          dirty={dirty}
          saving={save.isPending}
          error={errorMessage}
          onChange={setOverride}
          onSave={saveDraft}
          onPublish={publishDraft}
          onPause={() => {
            void pause.mutateAsync(undefined);
          }}
          publishing={publish.isPending || pause.isPending}
          fallbackColor={site.company.branding.primaryColor}
          oneWayRentals={site.oneWayRentals}
          onDiscard={() => setOverride(null)}
          onSignOut={() => {
            void signOut();
          }}
          fullscreen={view === EditorView.FULLSCREEN}
          onToggleFullscreen={() =>
            setView(view === EditorView.FULLSCREEN ? EditorView.SPLIT : EditorView.FULLSCREEN)
          }
          onPreview={() => setView(EditorView.PREVIEW)}
        />
      ) : null}
    </div>
  );
}
