"use client";

import { useTranslations } from "next-intl";
import type { SiteAppContent } from "@/types/siteContent";
import { EditorGroup, LocalizedField, TextField } from "./EditorPrimitives";

interface AppFormProps {
  app: SiteAppContent;
  locale: string;
  onChange: (app: SiteAppContent) => void;
}

export function AppForm({ app, locale, onChange }: AppFormProps) {
  const t = useTranslations("siteEditor.app");
  const tSite = useTranslations("siteSections.app");

  return (
    <>
      <EditorGroup title={t("storesTitle")} description={t("storesDescription")}>
        <TextField
          id="app-ios"
          label={t("ios")}
          type="url"
          value={app.iosUrl}
          placeholder="https://apps.apple.com/…"
          onChange={(iosUrl) => onChange({ ...app, iosUrl })}
        />
        <TextField
          id="app-android"
          label={t("android")}
          type="url"
          value={app.androidUrl}
          placeholder="https://play.google.com/store/apps/…"
          hint={t("qrHint")}
          onChange={(androidUrl) => onChange({ ...app, androidUrl })}
        />
      </EditorGroup>
      <EditorGroup title={t("copyTitle")}>
        <LocalizedField
          id="app-title"
          label={t("title")}
          value={app.title}
          locale={locale}
          maxLength={60}
          placeholder={tSite("title")}
          onChange={(title) => onChange({ ...app, title })}
        />
        <LocalizedField
          id="app-text"
          label={t("text")}
          value={app.text}
          locale={locale}
          maxLength={160}
          multiline
          placeholder={tSite("text")}
          onChange={(text) => onChange({ ...app, text })}
        />
      </EditorGroup>
    </>
  );
}
