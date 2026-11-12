"use client";

import { useTranslations } from "next-intl";
import { MAX_LEGAL_TEXT } from "@/lib/siteContent";
import type { SiteLegalContent } from "@/types/siteContent";
import { EditorGroup, LocalizedField } from "./EditorPrimitives";

interface LegalFormProps {
  legal: SiteLegalContent;
  locale: string;
  supported: boolean;
  onChange: (legal: SiteLegalContent) => void;
}

export function LegalForm({ legal, locale, supported, onChange }: LegalFormProps) {
  const t = useTranslations("siteEditor.legal");

  return (
    <>
      <p className="text-xs text-muted-foreground">{t("hint")}</p>
      {supported ? null : <p className="text-xs text-warning">{t("needsApi")}</p>}
      <fieldset disabled={!supported} className="flex flex-col gap-3 disabled:opacity-60">
        <EditorGroup title={t("privacyTitle")} description={t("privacyDescription")}>
          <LocalizedField
            id="legal-privacy"
            label={t("text")}
            value={legal.privacy}
            locale={locale}
            multiline
            tall
            maxLength={MAX_LEGAL_TEXT}
            placeholder={t("placeholder")}
            onChange={(privacy) => onChange({ ...legal, privacy })}
          />
        </EditorGroup>
        <EditorGroup title={t("termsTitle")} description={t("termsDescription")}>
          <LocalizedField
            id="legal-terms"
            label={t("text")}
            value={legal.terms}
            locale={locale}
            multiline
            tall
            maxLength={MAX_LEGAL_TEXT}
            placeholder={t("placeholder")}
            onChange={(terms) => onChange({ ...legal, terms })}
          />
        </EditorGroup>
      </fieldset>
    </>
  );
}
