"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageUp, ImageOff, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useUploadWebsiteImage } from "@/hooks/useWebsiteSettings";
import {
  DEFAULT_BANNER_THEME,
  MAX_SITE_BANNERS,
  bannerImages,
  emptyBanner,
  isHexColor,
  newContentId,
} from "@/lib/siteContent";
import type { SiteBanner, SiteBannerTheme } from "@/types/siteContent";
import { useBannerCopy } from "../SiteBannerCarousel";
import { ACCEPTED_IMAGES, MAX_UPLOAD_BYTES } from "./uploadLimits";
import {
  EditorGroup,
  ItemCard,
  LocalizedField,
  moveItem,
  replaceItem,
} from "./EditorPrimitives";

interface BannersFormProps {
  companyId: string;
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
];

const TEXT_FIELDS = ["script", "highlight", "joiner", "boxed", "description"] as const;
const MAX_LENGTH: Record<(typeof TEXT_FIELDS)[number], number> = {
  script: 60,
  highlight: 60,
  joiner: 60,
  boxed: 60,
  description: 200,
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

function BannerImagePicker({
  banner,
  companyId,
  background,
  onPick,
}: {
  banner: SiteBanner;
  companyId: string;
  background: string;
  onPick: (patch: Partial<SiteBanner>) => void;
}) {
  const t = useTranslations("siteEditor.banners");
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadWebsiteImage(companyId);
  const [tooLarge, setTooLarge] = useState(false);
  const images = bannerImages(banner);
  const inputId = `banner-${banner.id}-image`;

  async function onFile(file: File | undefined) {
    if (!file) {
      return;
    }
    setTooLarge(file.size > MAX_UPLOAD_BYTES);
    if (file.size > MAX_UPLOAD_BYTES) {
      return;
    }
    const result = await upload.mutateAsync(file).catch(() => null);
    if (result) {
      onPick({ preset: null, imageAssetId: result.id, imageUrl: result.url });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-foreground">{t("image")}</p>
      <div
        style={{ backgroundColor: background }}
        className="relative flex aspect-[4/1] w-full items-center justify-center overflow-hidden rounded-md border border-border"
      >
        {images ? (
          <Image
            src={images.desktop}
            alt=""
            fill
            unoptimized
            sizes="30rem"
            className="object-contain p-1"
          />
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-xs text-muted-foreground">
            <ImageOff size={14} aria-hidden />
            {t("noImage")}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{t("imageHint")}</p>
      <input
        ref={input}
        id={inputId}
        type="file"
        accept={ACCEPTED_IMAGES}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          void onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-fit"
        isLoading={upload.isPending}
        onClick={() => input.current?.click()}
      >
        <ImageUp size={14} aria-hidden />
        {images ? t("replaceImage") : t("uploadImage")}
      </Button>
      {tooLarge ? (
        <p className="text-xs text-danger" role="alert">
          {t("tooLarge")}
        </p>
      ) : upload.isError ? (
        <p className="text-xs text-danger" role="alert">
          {t("uploadFailed")}
        </p>
      ) : null}
    </div>
  );
}

export function BannersForm({ companyId, banners, theme, locale, onChange, onThemeChange }: BannersFormProps) {
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
              <BannerImagePicker
                banner={banner}
                companyId={companyId}
                background={theme.background}
                onPick={update}
              />
              {TEXT_FIELDS.map((field) => (
                <LocalizedField
                  key={field}
                  id={`banner-${banner.id}-${field}`}
                  label={t(`fields.${field}`)}
                  value={banner[field]}
                  locale={locale}
                  maxLength={MAX_LENGTH[field]}
                  multiline={field === "description"}
                  defaultText={banner.preset ? placeholder({ ...banner, [field]: {} }, field) : ""}
                  onChange={(value) => update({ [field]: value })}
                />
              ))}
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
                emptyBanner(newContentId("banner")),
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
