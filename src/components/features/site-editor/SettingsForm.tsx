"use client";

import { useTranslations } from "next-intl";
import { BookingMode, SiteStatus } from "@/enums";
import { cn } from "@/lib/utils";
import type { WebsiteSettings } from "@/types/websiteSettings";
import { EditorField, EditorGroup, TextField, editorSelectClass } from "./EditorPrimitives";

interface SettingsFormProps {
  draft: WebsiteSettings;
  onChange: (next: WebsiteSettings) => void;
}

function hours(value: string): number {
  const parsed = Math.round(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function SettingsForm({ draft, onChange }: SettingsFormProps) {
  const t = useTranslations("siteEditor.settings");

  return (
    <>
      <EditorGroup title={t("statusTitle")} description={t("statusDescription")}>
        <EditorField label={t("status")} htmlFor="settings-status">
          <select
            id="settings-status"
            className={editorSelectClass}
            value={draft.status}
            onChange={(event) => onChange({ ...draft, status: event.target.value as SiteStatus })}
          >
            <option value={SiteStatus.PUBLISHED}>{t("statusPublished")}</option>
            <option value={SiteStatus.DRAFT}>{t("statusDraft")}</option>
            <option value={SiteStatus.PAUSED}>{t("statusPaused")}</option>
          </select>
        </EditorField>
      </EditorGroup>
      <EditorGroup title={t("bookingTitle")} description={t("bookingDescription")}>
        <div className="grid grid-cols-2 gap-1 rounded-md bg-surface-muted p-1" role="radiogroup" aria-label={t("bookingMode")}>
          {[BookingMode.INSTANT, BookingMode.REQUEST].map((mode) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={draft.bookingMode === mode}
              onClick={() => onChange({ ...draft, bookingMode: mode })}
              className={cn(
                "cursor-pointer rounded px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                draft.bookingMode === mode
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`mode.${mode}`)}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t(`modeHint.${draft.bookingMode}`)}</p>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="settings-lead"
            label={t("minLead")}
            inputMode="numeric"
            value={String(draft.minLeadHours)}
            hint={t("hoursUnit")}
            onChange={(value) => onChange({ ...draft, minLeadHours: hours(value) })}
          />
          {draft.bookingMode === BookingMode.REQUEST ? (
            <TextField
              id="settings-window"
              label={t("requestWindow")}
              inputMode="numeric"
              value={String(draft.requestWindowHours)}
              hint={t("hoursUnit")}
              onChange={(value) => onChange({ ...draft, requestWindowHours: hours(value) })}
            />
          ) : null}
        </div>
      </EditorGroup>
      <EditorGroup title={t("domainTitle")} description={t("domainDescription")}>
        <TextField
          id="settings-domain"
          label={t("domain")}
          value={draft.domain}
          placeholder="www.example.com"
          onChange={(domain) => onChange({ ...draft, domain })}
        />
      </EditorGroup>
    </>
  );
}
