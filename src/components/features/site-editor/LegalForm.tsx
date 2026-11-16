"use client";

import { useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  joinLegalCopy,
  legalTemplateText,
  parseLegalBlocks,
  readLegalSections,
  serializeLegalBlocks,
  splitLegalCopy,
} from "@/lib/legal";
import { localizedText } from "@/lib/localizedCopy";
import { MAX_LEGAL_TEXT, newContentId } from "@/lib/siteContent";
import type { LocalizedCopy, SiteLegalContent } from "@/types/siteContent";
import { EditorField, EditorGroup, ItemCard, LocalizedField, moveItem, replaceItem } from "./EditorPrimitives";

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
      <LegalBlocksEditor
        key={locale}
        kind={kind}
        value={body}
        locale={locale}
        template={legalTemplateText(
          tDefault("lede"),
          readLegalSections(tDefault.raw("sections")),
        )}
        onChange={(nextBody) => onChange(joinLegalCopy(title, nextBody))}
      />
    </EditorGroup>
  );
}

interface EditableSection {
  id: string;
  title: string;
  body: string;
}

interface EditableBlocks {
  intro: string;
  sections: EditableSection[];
}

function toEditable(text: string): EditableBlocks {
  const blocks = parseLegalBlocks(text);
  return {
    intro: blocks.intro,
    sections: blocks.sections.map((section) => ({ ...section, id: newContentId("legal") })),
  };
}

function LegalBlocksEditor({
  kind,
  value,
  locale,
  template,
  onChange,
}: {
  kind: LegalKind;
  value: LocalizedCopy;
  locale: string;
  template: string;
  onChange: (next: LocalizedCopy) => void;
}) {
  const t = useTranslations("siteEditor.legal");
  const source = value[locale] || localizedText(value, locale).trim() || template;
  const [blocks, setBlocks] = useState(() => toEditable(source));
  const [emitted, setEmitted] = useState(source);

  if (source !== emitted) {
    setEmitted(source);
    setBlocks(toEditable(source));
  }

  const update = (next: EditableBlocks) => {
    setBlocks(next);
    const text = serializeLegalBlocks(next).slice(0, MAX_LEGAL_TEXT);
    const copy = { ...value };
    if (text && text !== template) {
      copy[locale] = text;
    } else {
      delete copy[locale];
    }
    setEmitted(text || template);
    onChange(copy);
  };

  return (
    <div className="flex flex-col gap-3">
      <EditorField label={t("intro")} htmlFor={`legal-${kind}-intro`}>
        <Textarea
          id={`legal-${kind}-intro`}
          value={blocks.intro}
          onChange={(event) => update({ ...blocks, intro: event.target.value })}
          className="min-h-20"
        />
      </EditorField>
      {blocks.sections.map((section, index) => (
        <ItemCard
          key={section.id}
          title={section.title || t("sectionItem", { position: index + 1 })}
          index={index}
          count={blocks.sections.length}
          onMove={(direction) =>
            update({ ...blocks, sections: moveItem(blocks.sections, index, direction) })
          }
          onRemove={() =>
            update({
              ...blocks,
              sections: blocks.sections.filter((_, position) => position !== index),
            })
          }
        >
          <EditorField label={t("subtitle")} htmlFor={`legal-${kind}-${section.id}-title`}>
            <Input
              id={`legal-${kind}-${section.id}-title`}
              value={section.title}
              maxLength={120}
              onChange={(event) =>
                update({
                  ...blocks,
                  sections: replaceItem(blocks.sections, index, {
                    ...section,
                    title: event.target.value,
                  }),
                })
              }
            />
          </EditorField>
          <EditorField label={t("text")} htmlFor={`legal-${kind}-${section.id}-body`}>
            <Textarea
              id={`legal-${kind}-${section.id}-body`}
              value={section.body}
              onChange={(event) =>
                update({
                  ...blocks,
                  sections: replaceItem(blocks.sections, index, {
                    ...section,
                    body: event.target.value,
                  }),
                })
              }
              className="min-h-28"
            />
          </EditorField>
        </ItemCard>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            update({
              ...blocks,
              sections: [...blocks.sections, { id: newContentId("legal"), title: "", body: "" }],
            })
          }
        >
          <Plus size={14} aria-hidden />
          {t("addSection")}
        </Button>
        {value[locale] ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const copy = { ...value };
              delete copy[locale];
              onChange(copy);
            }}
          >
            <RotateCcw size={14} aria-hidden />
            {t("reset")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function LegalForm({ legal, locale, supported, onChange }: LegalFormProps) {
  const t = useTranslations("siteEditor.legal");
  const tTerms = useTranslations("legal.terms");
  const privacyBody = (splitLegalCopy(legal.privacy).body[locale] ?? "").trim();
  const termsBody = (splitLegalCopy(legal.terms).body[locale] ?? "").trim();
  const privacyLooksLikeTerms =
    privacyBody.length > 0 &&
    (privacyBody === termsBody || privacyBody.startsWith(tTerms("lede")));

  return (
    <>
      <p className="text-xs text-muted-foreground">{t("hint")}</p>
      {supported ? null : <p className="text-xs text-warning">{t("needsApi")}</p>}
      {privacyLooksLikeTerms ? (
        <p role="alert" className="rounded-md border border-warning/40 bg-warning-soft px-3 py-2 text-xs text-foreground">
          {t("privacyLooksLikeTerms")}
        </p>
      ) : null}
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
