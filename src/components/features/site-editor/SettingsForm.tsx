"use client";

import { useTranslations } from "next-intl";
import { BookingMode, SiteStatus } from "@/enums";
import { cn } from "@/lib/utils";
import type { WebsiteSettings } from "@/types/websiteSettings";
import { EditorGroup, SwitchRow, TextField } from "./EditorPrimitives";

interface SettingsFormProps {
  draft: WebsiteSettings;
  oneWayRentals: boolean;
  onChange: (next: WebsiteSettings) => void;
  statusBusy: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

function hours(value: string, min: number, max: number): number {
  const parsed = Math.round(Number(value));
  if (!Number.isFinite(parsed)) {
    return min;
  }
  return Math.min(max, Math.max(min, parsed));
}

export function SettingsForm({
  draft,
  oneWayRentals,
  onChange,
  statusBusy,
  onEnabledChange,
}: SettingsFormProps) {
  const t = useTranslations("siteEditor.settings");

  return (
    <>
      <EditorGroup title={t("websiteTitle")}>
        <SwitchRow
          id="settings-website-enabled"
          label={t("websiteEnabled")}
          description={t("websiteEnabledHint")}
          checked={draft.status === SiteStatus.PUBLISHED}
          disabled={statusBusy || (draft.status !== SiteStatus.PUBLISHED && !draft.canPublish)}
          onCheckedChange={onEnabledChange}
        />
      </EditorGroup>
      <EditorGroup
        title={t("bookingTitle")}
        description={t("bookingDescription")}
      >
        <div
          className="grid grid-cols-2 gap-1 rounded-md bg-surface-muted p-1"
          role="radiogroup"
          aria-label={t("bookingMode")}
        >
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
        <p className="text-xs text-muted-foreground">
          {t(`modeHint.${draft.bookingMode}`)}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="settings-lead"
            label={t("minLead")}
            inputMode="numeric"
            value={String(draft.minLeadHours)}
            hint={t("hoursUnit")}
            onChange={(value) =>
              onChange({ ...draft, minLeadHours: hours(value, 0, 168) })
            }
          />
          {draft.bookingMode === BookingMode.REQUEST ? (
            <TextField
              id="settings-window"
              label={t("requestWindow")}
              inputMode="numeric"
              value={String(draft.requestWindowHours)}
              hint={t("hoursUnit")}
              onChange={(value) =>
                onChange({ ...draft, requestWindowHours: hours(value, 2, 72) })
              }
            />
          ) : null}
        </div>
      </EditorGroup>
      <EditorGroup title={t("differentReturnTitle")}>
        <SwitchRow
          id="settings-different-return"
          label={t("differentReturnLabel")}
          description={
            oneWayRentals ? t("differentReturnHint") : t("differentReturnOff")
          }
          checked={oneWayRentals && draft.content.allowDifferentReturn}
          disabled={!oneWayRentals}
          onCheckedChange={(allowDifferentReturn) =>
            onChange({
              ...draft,
              content: { ...draft.content, allowDifferentReturn },
            })
          }
        />
      </EditorGroup>
    </>
  );
}
