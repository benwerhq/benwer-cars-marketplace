"use client";

import Image from "next/image";
import { Check, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { SiteBannerPreset, SiteBannerTarget } from "@/enums";
import {
  BANNER_PRESET_IMAGES,
  DEFAULT_BANNER_THEME,
  MAX_SITE_BANNERS,
  isHexColor,
  newContentId,
  presetBanner,
} from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import type { SiteBanner, SiteBannerTheme } from "@/types/siteContent";
import { useBannerCopy } from "../SiteBannerCarousel";
import {
  EditorField,
  EditorGroup,
  ItemCard,
  LocalizedField,
  TextField,
  editorSelectClass,
  moveItem,
  replaceItem,
} from "./EditorPrimitives";

interface BannersFormProps {
  banners: SiteBanner[];
  theme: SiteBannerTheme;
  locale: string;
  onChange: (banners: SiteBanner[]) => void;
  onThemeChange: (theme: SiteBannerTheme) => void;
}

const THEME_FIELDS: (keyof SiteBannerTheme)[] = [
  "background",
  "text",
  "highlight",
  "highlightText",
  "box",
  "boxText",
  "script",
  "button",
  "buttonText",
];

const TEXT_FIELDS = ["script", "highlight", "joiner", "boxed", "description", "ctaLabel"] as const;
const MAX_LENGTH: Record<(typeof TEXT_FIELDS)[number], number> = {
  script: 60,
  highlight: 60,
  joiner: 60,
  boxed: 60,
  description: 200,
  ctaLabel: 30,
};

function ColorInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="color"
        value={isHexColor(value) ? value : "#000000"}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-10 shrink-0 cursor-pointer rounded-md border border-border-strong bg-surface p-0.5"
      />
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer text-xs text-foreground">
        {label}
      </label>
      <span className="font-mono text-[11px] text-muted-foreground uppercase">{value}</span>
    </div>
  );
}

export function BannersForm({ banners, theme, locale, onChange, onThemeChange }: BannersFormProps) {
  const t = useTranslations("siteEditor.banners");
  const placeholder = useBannerCopy();

  return (
    <>
      <EditorGroup title={t("colorsTitle")} description={t("colorsDescription")}>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {THEME_FIELDS.map((field) => (
            <ColorInput
              key={field}
              id={`banner-color-${field}`}
              label={t(`colors.${field}`)}
              value={theme[field]}
              onChange={(value) => onThemeChange({ ...theme, [field]: value })}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => onThemeChange({ ...DEFAULT_BANNER_THEME })}
        >
          {t("resetColors")}
        </Button>
      </EditorGroup>

      <EditorGroup title={t("title")} description={t("description", { max: MAX_SITE_BANNERS })}>
        {banners.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : null}
        {banners.map((banner, index) => {
          const update = (patch: Partial<SiteBanner>) =>
            onChange(replaceItem(banners, index, { ...banner, ...patch }));
          return (
            <ItemCard
              key={banner.id}
              title={placeholder(banner, "highlight") || t("item", { position: index + 1 })}
              index={index}
              count={banners.length}
              onMove={(direction) => onChange(moveItem(banners, index, direction))}
              onRemove={() => onChange(banners.filter((_, position) => position !== index))}
            >
              <fieldset className="flex flex-col gap-2">
                <legend className="text-xs font-medium text-foreground">{t("image")}</legend>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("image")}>
                  {Object.values(SiteBannerPreset).map((preset) => {
                    const selected = banner.preset === preset && !banner.imageUrl;
                    return (
                      <button
                        key={preset}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={t(`presets.${preset}`)}
                        onClick={() => update({ preset, imageUrl: null, imageAssetId: null })}
                        style={{ backgroundColor: theme.background }}
                        className={cn(
                          "relative aspect-[4/3] cursor-pointer overflow-hidden rounded-md border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          selected ? "border-primary" : "border-transparent hover:border-border-strong",
                        )}
                      >
                        <Image
                          src={BANNER_PRESET_IMAGES[preset]}
                          alt=""
                          fill
                          unoptimized
                          sizes="8rem"
                          className="object-contain p-1"
                        />
                        {selected ? (
                          <span className="absolute top-1 right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check size={12} aria-hidden />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{t("imageHint")}</p>
              </fieldset>
              {TEXT_FIELDS.map((field) => (
                <LocalizedField
                  key={field}
                  id={`banner-${banner.id}-${field}`}
                  label={t(`fields.${field}`)}
                  value={banner[field]}
                  locale={locale}
                  maxLength={MAX_LENGTH[field]}
                  multiline={field === "description"}
                  placeholder={banner.preset ? placeholder({ ...banner, [field]: {} }, field) : ""}
                  onChange={(value) => update({ [field]: value })}
                />
              ))}
              <EditorField label={t("ctaTarget")} htmlFor={`banner-${banner.id}-target`}>
                <select
                  id={`banner-${banner.id}-target`}
                  className={editorSelectClass}
                  value={banner.ctaTarget}
                  onChange={(event) =>
                    update({ ctaTarget: event.target.value as SiteBannerTarget })
                  }
                >
                  {Object.values(SiteBannerTarget).map((target) => (
                    <option key={target} value={target}>
                      {t(`targets.${target}`)}
                    </option>
                  ))}
                </select>
              </EditorField>
              {banner.ctaTarget === SiteBannerTarget.URL ? (
                <TextField
                  id={`banner-${banner.id}-url`}
                  label={t("ctaUrl")}
                  type="url"
                  value={banner.ctaUrl}
                  placeholder="https://"
                  hint={t("ctaUrlHint")}
                  onChange={(ctaUrl) => update({ ctaUrl })}
                />
              ) : null}
            </ItemCard>
          );
        })}
        {banners.length < MAX_SITE_BANNERS ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-fit"
            onClick={() =>
              onChange([
                ...banners,
                presetBanner(SiteBannerPreset.ROADTRIP, newContentId("banner")),
              ])
            }
          >
            <Plus size={14} aria-hidden />
            {t("add")}
          </Button>
        ) : null}
      </EditorGroup>
    </>
  );
}
