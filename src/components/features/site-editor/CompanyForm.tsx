"use client";

import { useTranslations } from "next-intl";
import type { WebsiteSettings } from "@/types/websiteSettings";
import { EditorGroup, LocalizedField, SwitchRow } from "./EditorPrimitives";

interface CompanyFormProps {
  draft: WebsiteSettings;
  locale: string;
  companyName: string;
  onChange: (next: WebsiteSettings) => void;
}

export function CompanyForm({ draft, locale, companyName, onChange }: CompanyFormProps) {
  const t = useTranslations("siteEditor.company");

  return (
    <>
      <EditorGroup title={t("title")} description={t("description")}>
        <LocalizedField
          id="company-headline"
          label={t("headline")}
          value={draft.headline}
          locale={locale}
          maxLength={120}
          placeholder={t("headlinePlaceholder", { name: companyName })}
          onChange={(headline) => onChange({ ...draft, headline })}
        />
        <LocalizedField
          id="company-intro"
          label={t("intro")}
          value={draft.intro}
          locale={locale}
          maxLength={600}
          multiline
          hint={t("introHint")}
          onChange={(intro) => onChange({ ...draft, intro })}
        />
      </EditorGroup>
      <EditorGroup title={t("contactTitle")} description={t("contactDescription")}>
        <SwitchRow
          id="company-show-phone"
          label={t("showPhone")}
          checked={draft.showPhone}
          onCheckedChange={(showPhone) => onChange({ ...draft, showPhone })}
        />
        <SwitchRow
          id="company-show-email"
          label={t("showEmail")}
          checked={draft.showEmail}
          onCheckedChange={(showEmail) => onChange({ ...draft, showEmail })}
        />
        <SwitchRow
          id="company-show-address"
          label={t("showAddress")}
          checked={draft.showAddress}
          onCheckedChange={(showAddress) => onChange({ ...draft, showAddress })}
        />
      </EditorGroup>
    </>
  );
}
