"use client";

import { useTranslations } from "next-intl";
import { joinLegalCopy, legalTemplateText, readLegalSections, splitLegalCopy } from "@/lib/legal";
import { MAX_LEGAL_TEXT } from "@/lib/siteContent";
import type { LocalizedCopy, SiteLegalContent } from "@/types/siteContent";
import { EditorGroup, LocalizedField } from "./EditorPrimitives";

type LegalKind = keyof SiteLegalContent;

interface LegalFormProps {
  legal: SiteLegalContent;
  locale: string;
  supported: boolean;
  onChange: (legal: SiteLegalContent) => void;
}

function LegalPageFields({
  kind,
  value,
  locale,
  onChange,
}: {
  kind: LegalKind;
  value: LocalizedCopy;
  locale: string;
  onChange: (next: LocalizedCopy) => void;
}) {
  const t = useTranslations("siteEditor.legal");
  const tDefault = useTranslations(`legal.${kind}`);
  const { title, body } = splitLegalCopy(value);

  return (
    <EditorGroup title={t(`${kind}Title`)} description={t(`${kind}Description`)}>
      <LocalizedField
        id={`legal-${kind}-title`}
        label={t("pageTitle")}
        value={title}
        locale={locale}
        maxLength={120}
        defaultText={tDefault("title")}
        onChange={(nextTitle) => onChange(joinLegalCopy(nextTitle, body))}
      />
      <LocalizedField
        id={`legal-${kind}`}
        label={t("text")}
        value={body}
        locale={locale}
        multiline
        tall
        maxLength={MAX_LEGAL_TEXT}
        defaultText={legalTemplateText(
          tDefault("lede"),
          readLegalSections(tDefault.raw("sections")),
        )}
        onChange={(nextBody) => onChange(joinLegalCopy(title, nextBody))}
      />
    </EditorGroup>
  );
}

export function LegalForm({ legal, locale, supported, onChange }: LegalFormProps) {
  const t = useTranslations("siteEditor.legal");

  return (
    <>
      <p className="text-xs text-muted-foreground">{t("hint")}</p>
      {supported ? null : <p className="text-xs text-warning">{t("needsApi")}</p>}
      <fieldset disabled={!supported} className="flex flex-col gap-3 disabled:opacity-60">
        {(["privacy", "terms"] as const).map((kind) => (
          <LegalPageFields
            key={kind}
            kind={kind}
            value={legal[kind]}
            locale={locale}
            onChange={(next) => onChange({ ...legal, [kind]: next })}
          />
        ))}
      </fieldset>
    </>
  );
}
