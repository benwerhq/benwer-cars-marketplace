"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { DehydratedState } from "@tanstack/react-query";
import { SiteEditor } from "@/components/features/site-editor/SiteEditor";
import { SiteHomeLayouts } from "@/components/features/SiteHomeLayouts";
import { useStaffAuth } from "@/context/StaffAuthProvider";
import {
  usePauseWebsite,
  usePublishWebsite,
  useSaveWebsiteSettings,
  useWebsiteSettings,
} from "@/hooks/useWebsiteSettings";
import { getErrorKey } from "@/lib/errors";
import { localizedText } from "@/lib/localizedCopy";
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

  const canEdit = Boolean(user && settings.data?.canEdit);
  const liveSite = canEdit ? applyWebsiteDraft(site, draft) : site;
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
  } as CSSProperties;
  const mutationError = save.error ?? publish.error ?? pause.error;

  return (
    <div
      style={style}
      className={cn("bg-background", canEdit && "lg:grid lg:grid-cols-[minmax(0,1fr)_34rem]")}
    >
      <div>
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
      {canEdit ? (
        <SiteEditor
          draft={draft}
          companyId={site.company.id}
          companyName={liveSite.company.name}
          companyLogo={site.company.branding.logoUrl}
          facts={{
            branchCount: liveSite.branches.length,
            hasPhone: Boolean(copy.phone),
            hasEmail: Boolean(copy.email),
          }}
          dirty={dirty}
          saving={save.isPending}
          error={mutationError ? tRoot(getErrorKey(mutationError)) : null}
          onChange={setOverride}
          onSave={() => {
            void save.mutateAsync(toWebsitePatch(draft)).then(() => {
              setOverride(null);
              router.refresh();
            });
          }}
          onPublish={() => {
            void publish.mutateAsync(undefined);
          }}
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
        />
      ) : null}
    </div>
  );
}
