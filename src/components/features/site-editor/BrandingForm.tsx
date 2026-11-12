"use client";

import { useRef, useState } from "react";
import { Check, ImageUp, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { CompanyMark } from "@/components/features/CompanyMark";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUploadWebsiteImage } from "@/hooks/useWebsiteSettings";
import { DEFAULT_PAGE_BACKGROUND, isHexColor } from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import type { SiteContent, SiteLogos } from "@/types/siteContent";
import { EditorField, EditorGroup } from "./EditorPrimitives";

const BACKGROUND_PRESETS = ["#ffffff", "#fafaf9", "#f8fafc", "#f5f5f4", "#f0fdfa", "#fdf8f0"];
const ACCEPTED_IMAGES = "image/png,image/jpeg,image/webp";
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

type LogoSlot = "header" | "company";

interface BrandingFormProps {
  content: SiteContent;
  companyId: string;
  companyName: string;
  companyLogo: string | null;
  onChange: (patch: Partial<SiteContent>) => void;
}

export function BrandingForm({
  content,
  companyId,
  companyName,
  companyLogo,
  onChange,
}: BrandingFormProps) {
  const t = useTranslations("siteEditor.branding");
  const supported = content.supportsSiteBranding;
  const background = content.pageBackground;
  const setBackground = (pageBackground: string) => onChange({ pageBackground });
  const setLogos = (logos: SiteLogos) => onChange({ logos });

  return (
    <>
      <EditorGroup title={t("logosTitle")} description={t("logosDescription")}>
        {supported ? null : <p className="text-xs text-warning">{t("needsApi")}</p>}
        <LogoPicker
          slot="header"
          label={t("headerLogo")}
          hint={t("headerLogoHint")}
          url={content.logos.headerUrl}
          companyId={companyId}
          companyName={companyName}
          companyLogo={companyLogo}
          disabled={!supported}
          onPick={(id, url) => setLogos({ ...content.logos, headerAssetId: id, headerUrl: url })}
        />
        <LogoPicker
          slot="company"
          label={t("companyLogo")}
          hint={t("companyLogoHint")}
          url={content.logos.companyUrl}
          companyId={companyId}
          companyName={companyName}
          companyLogo={companyLogo}
          disabled={!supported}
          onPick={(id, url) => setLogos({ ...content.logos, companyAssetId: id, companyUrl: url })}
        />
      </EditorGroup>
      <EditorGroup title={t("backgroundTitle")} description={t("backgroundDescription")}>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("backgroundPresets")}>
          {BACKGROUND_PRESETS.map((preset) => {
            const selected = preset.toLowerCase() === background.toLowerCase();
            return (
              <button
                key={preset}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={preset}
                disabled={!supported}
                onClick={() => setBackground(preset)}
                style={{ backgroundColor: preset }}
                className={cn(
                  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border-strong text-foreground ring-offset-2 ring-offset-surface transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                  selected && "ring-2 ring-foreground",
                )}
              >
                {selected ? <Check size={14} aria-hidden /> : null}
              </button>
            );
          })}
        </div>
        <EditorField label={t("backgroundCustom")} htmlFor="design-background">
          <div className="flex gap-2">
            <input
              type="color"
              aria-label={t("backgroundPicker")}
              disabled={!supported}
              value={isHexColor(background) ? background : DEFAULT_PAGE_BACKGROUND}
              onChange={(event) => setBackground(event.target.value)}
              className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border-strong bg-surface p-1 disabled:cursor-not-allowed"
            />
            <Input
              id="design-background"
              value={background}
              disabled={!supported}
              placeholder={DEFAULT_PAGE_BACKGROUND}
              maxLength={7}
              onChange={(event) => setBackground(event.target.value)}
            />
          </div>
        </EditorField>
      </EditorGroup>
    </>
  );
}

interface LogoPickerProps {
  slot: LogoSlot;
  label: string;
  hint: string;
  url: string | null;
  companyId: string;
  companyName: string;
  companyLogo: string | null;
  disabled: boolean;
  onPick: (id: string | null, url: string | null) => void;
}

function LogoPicker({
  slot,
  label,
  hint,
  url,
  companyId,
  companyName,
  companyLogo,
  disabled,
  onPick,
}: LogoPickerProps) {
  const t = useTranslations("siteEditor.branding");
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadWebsiteImage(companyId);
  const [tooLarge, setTooLarge] = useState(false);
  const custom = Boolean(url);
  const inputId = `site-logo-${slot}`;

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
      onPick(result.id, result.url);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">
            {custom ? t("customLogo") : t("usingCompanyLogo")}
          </p>
        </div>
        <div className="flex h-12 max-w-[11rem] shrink-0 items-center justify-end rounded-md bg-surface-muted px-2">
          <CompanyMark
            company={{
              name: companyName,
              branding: { primaryColor: "", logoUrl: url || companyLogo },
            }}
            size="sm"
            className="h-8"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
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
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          isLoading={upload.isPending}
          onClick={() => input.current?.click()}
        >
          <ImageUp size={14} aria-hidden />
          {custom ? t("replace") : t("upload")}
        </Button>
        {custom ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onPick(null, null)}
          >
            <RotateCcw size={14} aria-hidden />
            {t("useCompanyLogo")}
          </Button>
        ) : null}
      </div>
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
