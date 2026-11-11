"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { DehydratedState } from "@tanstack/react-query";
import { OwnerEditPanel } from "@/components/features/OwnerEditPanel";
import { SiteHomeLayouts } from "@/components/features/SiteHomeLayouts";
import { useStaffAuth } from "@/context/StaffAuthProvider";
import {
  useSaveWebsiteSettings,
  useWebsiteSettings,
} from "@/hooks/useWebsiteSettings";
import { getErrorKey } from "@/lib/errors";
import { localizedText } from "@/lib/localizedCopy";
import {
  applyWebsiteDraft,
  settingsFromSite,
  websiteDraftDirty,
} from "@/lib/websiteDraft";
import type { PublicSite } from "@/types/site";
import type { WebsiteSettings } from "@/types/websiteSettings";

interface OwnerHomeRootProps {
  site: PublicSite;
  companySlug: string;
  preview?: string;
  from: string;
  to: string;
  branch: string;
  dehydratedState: DehydratedState;
}

export function OwnerHomeRoot({
  site,
  companySlug,
  preview,
  from,
  to,
  branch,
  dehydratedState,
}: OwnerHomeRootProps) {
  const locale = useLocale();
  const tSite = useTranslations("site");
  const tRoot = useTranslations();
  const { user, signOut } = useStaffAuth();
  const settings = useWebsiteSettings();
  const save = useSaveWebsiteSettings();
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
  };
  const dirty = canEdit && websiteDraftDirty(baseline, draft);
  const style = liveSite.company.branding.primaryColor
    ? ({ "--primary": liveSite.company.branding.primaryColor } as CSSProperties)
    : undefined;

  return (
    <div
      style={style}
      className={canEdit ? "lg:grid lg:grid-cols-[minmax(0,1fr)_20rem]" : undefined}
    >
      <div>
        <SiteHomeLayouts
          site={liveSite}
          copy={copy}
          companySlug={companySlug}
          preview={preview}
          from={from}
          to={to}
          branch={branch}
          dehydratedState={dehydratedState}
        />
      </div>
      {canEdit ? (
        <OwnerEditPanel
          draft={draft}
          dirty={dirty}
          saving={save.isPending}
          error={save.error ? tRoot(getErrorKey(save.error)) : null}
          onChange={setOverride}
          onSave={() => {
            void save.mutateAsync(draft).then(() => setOverride(null));
          }}
          onDiscard={() => setOverride(null)}
          onSignOut={() => {
            void signOut();
          }}
        />
      ) : null}
    </div>
  );
}
