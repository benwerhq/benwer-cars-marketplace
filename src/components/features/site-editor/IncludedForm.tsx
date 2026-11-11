"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { SiteIncludedIcon, SiteIncludedPreset } from "@/enums";
import {
  MAX_SITE_INCLUDED,
  newContentId,
  presetIncludedItem,
} from "@/lib/siteContent";
import type { SiteIncludedItem } from "@/types/siteContent";
import { useIncludedCopy } from "../SiteIncludedSection";
import {
  EditorField,
  EditorGroup,
  ItemCard,
  LocalizedField,
  editorSelectClass,
  moveItem,
  replaceItem,
} from "./EditorPrimitives";

interface IncludedFormProps {
  items: SiteIncludedItem[];
  locale: string;
  onChange: (items: SiteIncludedItem[]) => void;
}

export function IncludedForm({ items, locale, onChange }: IncludedFormProps) {
  const t = useTranslations("siteEditor.included");
  const tIcons = useTranslations("siteEditor.icons");
  const defaults = useIncludedCopy();
  const missingPresets = Object.values(SiteIncludedPreset).filter(
    (preset) => !items.some((item) => item.preset === preset),
  );

  return (
    <EditorGroup title={t("title")} description={t("description")}>
      <p className="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">{t("accuracy")}</p>
      {items.map((item, index) => {
        const placeholder = defaults({ ...item, title: {}, text: {}, tag: {} });
        const update = (patch: Partial<SiteIncludedItem>) =>
          onChange(replaceItem(items, index, { ...item, ...patch }));
        return (
          <ItemCard
            key={item.id}
            title={defaults(item).title || t("item", { position: index + 1 })}
            index={index}
            count={items.length}
            onMove={(direction) => onChange(moveItem(items, index, direction))}
            onRemove={() => onChange(items.filter((_, position) => position !== index))}
          >
            <EditorField label={t("icon")} htmlFor={`included-${item.id}-icon`}>
              <select
                id={`included-${item.id}-icon`}
                className={editorSelectClass}
                value={item.icon}
                onChange={(event) => update({ icon: event.target.value as SiteIncludedIcon })}
              >
                {Object.values(SiteIncludedIcon).map((icon) => (
                  <option key={icon} value={icon}>
                    {tIcons(icon)}
                  </option>
                ))}
              </select>
            </EditorField>
            <LocalizedField
              id={`included-${item.id}-title`}
              label={t("itemTitle")}
              value={item.title}
              locale={locale}
              maxLength={40}
              placeholder={placeholder.title}
              onChange={(title) => update({ title })}
            />
            <LocalizedField
              id={`included-${item.id}-text`}
              label={t("itemText")}
              value={item.text}
              locale={locale}
              maxLength={90}
              placeholder={placeholder.text}
              onChange={(text) => update({ text })}
            />
            <LocalizedField
              id={`included-${item.id}-tag`}
              label={t("itemTag")}
              value={item.tag}
              locale={locale}
              maxLength={24}
              placeholder={placeholder.tag}
              hint={t("tagHint")}
              onChange={(tag) => update({ tag })}
            />
          </ItemCard>
        );
      })}
      {items.length < MAX_SITE_INCLUDED ? (
        <div className="flex flex-wrap gap-2">
          {missingPresets.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onChange([...items, presetIncludedItem(preset)])}
            >
              <Plus size={14} aria-hidden />
              {t(`presets.${preset}`)}
            </Button>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              onChange([
                ...items,
                {
                  id: newContentId("included"),
                  preset: null,
                  icon: SiteIncludedIcon.CHECK,
                  title: {},
                  text: {},
                  tag: {},
                },
              ])
            }
          >
            <Plus size={14} aria-hidden />
            {t("addCustom")}
          </Button>
        </div>
      ) : null}
    </EditorGroup>
  );
}
