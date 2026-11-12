"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { SiteCornerStyle, SiteFontFamily } from "@/enums";
import {
  contrastWithWhite,
  isHexColor,
  siteFontStack,
  withBrandColor,
} from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import type { WebsiteSettings } from "@/types/websiteSettings";
import { EditorField, EditorGroup } from "./EditorPrimitives";

const BRAND_COLOR_PRESETS = [
  "#0e7490",
  "#0f766e",
  "#1d4ed8",
  "#4338ca",
  "#6d28d9",
  "#be185d",
  "#b91c1c",
  "#c2410c",
  "#15803d",
  "#0f172a",
];

export const MIN_BRAND_CONTRAST = 4.5;

interface DesignFormProps {
  draft: WebsiteSettings;
  fallbackColor: string;
  onChange: (next: WebsiteSettings) => void;
}

export function DesignForm({
  draft,
  fallbackColor,
  onChange,
}: DesignFormProps) {
  const t = useTranslations("siteEditor.design");
  const value = draft.content.brandColor || fallbackColor;
  const color = isHexColor(value) ? value : "";
  const lowContrast =
    Boolean(color) && contrastWithWhite(color) < MIN_BRAND_CONTRAST;
  const setColor = (brandColor: string) =>
    onChange({ ...draft, content: withBrandColor(draft.content, brandColor) });
  const setFont = (fontFamily: SiteFontFamily) =>
    onChange({ ...draft, content: { ...draft.content, fontFamily } });
  const setCorners = (cornerStyle: SiteCornerStyle) =>
    onChange({ ...draft, content: { ...draft.content, cornerStyle } });

  return (
    <>
      <EditorGroup title={t("colorTitle")} description={t("colorDescription")}>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label={t("presets")}
        >
          {BRAND_COLOR_PRESETS.map((preset) => {
            const selected = preset.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={preset}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={preset}
                onClick={() => setColor(preset)}
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
        <EditorField
          label={t("custom")}
          htmlFor="design-color"
          hint={t("customHint")}
        >
          <div className="flex gap-2">
            <input
              type="color"
              aria-label={t("picker")}
              value={color || "#0e7490"}
              onChange={(event) => setColor(event.target.value)}
              className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border-strong bg-surface p-1"
            />
            <Input
              id="design-color"
              value={value}
              placeholder="#0e7490"
              maxLength={7}
              onChange={(event) => setColor(event.target.value)}
            />
          </div>
        </EditorField>
        {lowContrast ? (
          <p
            role="alert"
            className="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning"
          >
            {t("lowContrast")}
          </p>
        ) : null}
      </EditorGroup>
      <EditorGroup title={t("fontTitle")} description={t("fontDescription")}>
        <div
          className="grid gap-2"
          role="radiogroup"
          aria-label={t("fontTitle")}
        >
          {Object.values(SiteFontFamily).map((font) => {
            const selected = draft.content.fontFamily === font;
            return (
              <button
                key={font}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setFont(font)}
                style={{ fontFamily: siteFontStack(font) }}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-surface-hover",
                )}
              >
                <span className="text-2xl leading-none font-semibold text-foreground">
                  Aa
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {t(`fonts.${font}.name`)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t(`fonts.${font}.hint`)}
                  </span>
                </span>
                {selected ? (
                  <Check size={16} className="text-primary" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
      </EditorGroup>
      <EditorGroup
        title={t("cornersTitle")}
        description={t("cornersDescription")}
      >
        <div
          className="grid grid-cols-2 gap-2"
          role="radiogroup"
          aria-label={t("cornersTitle")}
        >
          {Object.values(SiteCornerStyle).map((corners) => {
            const selected = draft.content.cornerStyle === corners;
            return (
              <button
                key={corners}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setCorners(corners)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-surface-hover",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-7 w-10 shrink-0 border-2 border-foreground/70 bg-surface",
                    corners === SiteCornerStyle.ROUND
                      ? "rounded-lg"
                      : "rounded-none",
                  )}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {t(`corners.${corners}.name`)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t(`corners.${corners}.hint`)}
                  </span>
                </span>
                {selected ? (
                  <Check size={16} className="text-primary" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
      </EditorGroup>
    </>
  );
}
