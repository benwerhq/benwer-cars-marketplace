"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { MAX_SITE_BANNERS, newContentId } from "@/lib/siteContent";
import type { SiteBanner } from "@/types/siteContent";
import {
  EditorGroup,
  ItemCard,
  LocalizedField,
  TextField,
  moveItem,
  replaceItem,
} from "./EditorPrimitives";

interface BannersFormProps {
  banners: SiteBanner[];
  locale: string;
  onChange: (banners: SiteBanner[]) => void;
}

export function BannersForm({ banners, locale, onChange }: BannersFormProps) {
  const t = useTranslations("siteEditor.banners");

  return (
    <EditorGroup
      title={t("title")}
      description={t("description", { max: MAX_SITE_BANNERS })}
    >
      <p className="rounded-md bg-info-soft px-3 py-2 text-xs text-info">{t("sizeHint")}</p>
      {banners.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : null}
      {banners.map((banner, index) => {
        const update = (patch: Partial<SiteBanner>) =>
          onChange(replaceItem(banners, index, { ...banner, ...patch }));
        return (
          <ItemCard
            key={banner.id}
            title={t("item", { position: index + 1 })}
            index={index}
            count={banners.length}
            onMove={(direction) => onChange(moveItem(banners, index, direction))}
            onRemove={() => onChange(banners.filter((_, position) => position !== index))}
          >
            <TextField
              id={`banner-${banner.id}-image`}
              label={t("imageUrl")}
              value={banner.imageUrl}
              type="url"
              placeholder="https://"
              hint={t("imageHint")}
              onChange={(imageUrl) => update({ imageUrl })}
            />
            <LocalizedField
              id={`banner-${banner.id}-title`}
              label={t("headline")}
              value={banner.title}
              locale={locale}
              maxLength={80}
              hint={t("headlineHint")}
              onChange={(title) => update({ title })}
            />
            <LocalizedField
              id={`banner-${banner.id}-subtitle`}
              label={t("subtitle")}
              value={banner.subtitle}
              locale={locale}
              maxLength={140}
              onChange={(subtitle) => update({ subtitle })}
            />
            <TextField
              id={`banner-${banner.id}-link`}
              label={t("link")}
              value={banner.linkUrl}
              type="url"
              placeholder="https://"
              onChange={(linkUrl) => update({ linkUrl })}
            />
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
              { id: newContentId("banner"), imageUrl: "", title: {}, subtitle: {}, linkUrl: "" },
            ])
          }
        >
          <Plus size={14} aria-hidden />
          {t("add")}
        </Button>
      ) : null}
    </EditorGroup>
  );
}
