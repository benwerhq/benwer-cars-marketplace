"use client";

import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { localizedText } from "@/lib/localizedCopy";
import { MAX_SITE_FAQ, newContentId } from "@/lib/siteContent";
import type { SiteFaqItem } from "@/types/siteContent";
import {
  EditorGroup,
  ItemCard,
  LocalizedField,
  moveItem,
  replaceItem,
} from "./EditorPrimitives";

interface FaqFormProps {
  items: SiteFaqItem[];
  locale: string;
  onChange: (items: SiteFaqItem[]) => void;
}

export function FaqForm({ items, locale, onChange }: FaqFormProps) {
  const t = useTranslations("siteEditor.faq");
  const uiLocale = useLocale();

  return (
    <EditorGroup title={t("title")} description={t("description", { max: MAX_SITE_FAQ })}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : null}
      {items.map((item, index) => {
        const update = (patch: Partial<SiteFaqItem>) =>
          onChange(replaceItem(items, index, { ...item, ...patch }));
        return (
          <ItemCard
            key={item.id}
            title={
              localizedText(item.question, locale) ||
              localizedText(item.question, uiLocale) ||
              t("item", { position: index + 1 })
            }
            index={index}
            count={items.length}
            onMove={(direction) => onChange(moveItem(items, index, direction))}
            onRemove={() => onChange(items.filter((_, position) => position !== index))}
          >
            <LocalizedField
              id={`faq-${item.id}-question`}
              label={t("question")}
              value={item.question}
              locale={locale}
              maxLength={140}
              onChange={(question) => update({ question })}
            />
            <LocalizedField
              id={`faq-${item.id}-answer`}
              label={t("answer")}
              value={item.answer}
              locale={locale}
              maxLength={800}
              multiline
              onChange={(answer) => update({ answer })}
            />
          </ItemCard>
        );
      })}
      <p className="text-xs text-muted-foreground">{t("incompleteHint")}</p>
      {items.length < MAX_SITE_FAQ ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-fit"
          onClick={() =>
            onChange([...items, { id: newContentId("faq"), question: {}, answer: {} }])
          }
        >
          <Plus size={14} aria-hidden />
          {t("add")}
        </Button>
      ) : null}
    </EditorGroup>
  );
}
