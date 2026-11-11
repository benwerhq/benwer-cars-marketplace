"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { SITE_LAYOUTS } from "@/lib/siteLayout";
import { cn } from "@/lib/utils";
import type { WebsiteSettings } from "@/types/websiteSettings";
import { EditorField, EditorGroup } from "./EditorPrimitives";

const BRAND_COLOR_PRESETS = [
  "#0d9488",
  "#0e7490",
  "#2563eb",
  "#4f46e5",
  "#7c3aed",
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#16a34a",
  "#0f172a",
];

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

interface DesignFormProps {
  draft: WebsiteSettings;
  onChange: (next: WebsiteSettings) => void;
}

export function DesignForm({ draft, onChange }: DesignFormProps) {
  const t = useTranslations("siteEditor.design");
  const tLayouts = useTranslations("owner.layouts");
  const color = HEX_COLOR.test(draft.primaryColor) ? draft.primaryColor : "";

  return (
    <>
      <EditorGroup title={t("colorTitle")} description={t("colorDescription")}>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("presets")}>
          {BRAND_COLOR_PRESETS.map((preset) => {
            const selected = preset.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={preset}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={preset}
                onClick={() => onChange({ ...draft, primaryColor: preset })}
                style={{ backgroundColor: preset }}
                className={cn(
                  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-primary-foreground ring-offset-2 ring-offset-surface transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected && "ring-2 ring-foreground",
                )}
              >
                {selected ? <Check size={14} aria-hidden /> : null}
              </button>
            );
          })}
        </div>
        <EditorField label={t("custom")} htmlFor="design-color" hint={t("customHint")}>
          <div className="flex gap-2">
            <input
              type="color"
              aria-label={t("picker")}
              value={color || "#0d9488"}
              onChange={(event) => onChange({ ...draft, primaryColor: event.target.value })}
              className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border-strong bg-surface p-1"
            />
            <Input
              id="design-color"
              value={draft.primaryColor}
              placeholder="#0d9488"
              maxLength={7}
              onChange={(event) => onChange({ ...draft, primaryColor: event.target.value })}
            />
          </div>
        </EditorField>
      </EditorGroup>
      <EditorGroup title={t("layoutTitle")} description={t("layoutDescription")}>
        <div className="grid gap-2" role="radiogroup" aria-label={t("layoutTitle")}>
          {SITE_LAYOUTS.map((layout) => {
            const selected = draft.layout === layout;
            return (
              <button
                key={layout}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ ...draft, layout })}
                className={cn(
                  "flex cursor-pointer items-start justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border-strong hover:bg-surface-hover",
                )}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {tLayouts(`${layout}.name`)}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {tLayouts(`${layout}.hint`)}
                  </span>
                </span>
                {selected ? <Check size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      </EditorGroup>
    </>
  );
}
