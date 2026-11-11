"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { SITE_LAYOUTS } from "@/lib/siteLayout";
import { cn } from "@/lib/utils";
import type { WebsiteSettings } from "@/types/websiteSettings";
import { BookingMode, SiteStatus } from "@/enums";

interface OwnerEditPanelProps {
  draft: WebsiteSettings;
  dirty: boolean;
  saving: boolean;
  error?: string | null;
  onChange: (next: WebsiteSettings) => void;
  onSave: () => void;
  onDiscard: () => void;
  onSignOut: () => void;
}

export function OwnerEditPanel({
  draft,
  dirty,
  saving,
  error,
  onChange,
  onSave,
  onDiscard,
  onSignOut,
}: OwnerEditPanelProps) {
  const t = useTranslations("owner");
  const localeKey = "en-GB";

  return (
    <aside className="flex w-full flex-col gap-4 border-b border-border bg-surface px-4 py-4 shadow-sm lg:sticky lg:top-16 lg:z-30 lg:max-h-[calc(100dvh-4rem)] lg:w-80 lg:overflow-y-auto lg:border-b-0 lg:border-l">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{t("toolbarTitle")}</p>
          <p className="text-xs text-muted-foreground">
            {dirty ? t("unpublished") : t("saved")}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onSignOut}>
          {t("signOut")}
        </Button>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("layout")}
        </p>
        <div className="grid grid-cols-1 gap-2">
          {SITE_LAYOUTS.map((layout) => (
            <button
              key={layout}
              type="button"
              onClick={() => onChange({ ...draft, layout })}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-sm",
                draft.layout === layout
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              <span className="font-medium text-foreground">
                {t(`layouts.${layout}.name`)}
              </span>
              <span className="mt-0.5 block text-xs">
                {t(`layouts.${layout}.hint`)}
              </span>
            </button>
          ))}
        </div>
      </div>
      <Field label={t("headline")} htmlFor="owner-headline">
        <Input
          id="owner-headline"
          value={draft.headline[localeKey] ?? ""}
          onChange={(event) =>
            onChange({
              ...draft,
              headline: { ...draft.headline, [localeKey]: event.target.value },
            })
          }
        />
      </Field>
      <Field label={t("intro")} htmlFor="owner-intro">
        <Input
          id="owner-intro"
          value={draft.intro[localeKey] ?? ""}
          onChange={(event) =>
            onChange({
              ...draft,
              intro: { ...draft.intro, [localeKey]: event.target.value },
            })
          }
        />
      </Field>
      <Field label={t("primaryColor")} htmlFor="owner-color">
        <Input
          id="owner-color"
          value={draft.primaryColor}
          onChange={(event) =>
            onChange({ ...draft, primaryColor: event.target.value })
          }
        />
      </Field>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={draft.showPhone}
          onChange={(event) =>
            onChange({ ...draft, showPhone: event.target.checked })
          }
        />
        {t("showPhone")}
      </label>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={draft.showEmail}
          onChange={(event) =>
            onChange({ ...draft, showEmail: event.target.checked })
          }
        />
        {t("showEmail")}
      </label>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={draft.showAddress}
          onChange={(event) =>
            onChange({ ...draft, showAddress: event.target.checked })
          }
        />
        {t("showAddress")}
      </label>
      <Field label={t("bookingMode")} htmlFor="owner-mode">
        <select
          id="owner-mode"
          className="flex h-9 w-full rounded-md border border-border-strong bg-surface px-3 text-sm"
          value={draft.bookingMode}
          onChange={(event) =>
            onChange({
              ...draft,
              bookingMode: event.target.value as BookingMode,
            })
          }
        >
          <option value={BookingMode.INSTANT}>{t("modeInstant")}</option>
          <option value={BookingMode.REQUEST}>{t("modeRequest")}</option>
        </select>
      </Field>
      <Field label={t("status")} htmlFor="owner-status">
        <select
          id="owner-status"
          className="flex h-9 w-full rounded-md border border-border-strong bg-surface px-3 text-sm"
          value={draft.status}
          onChange={(event) =>
            onChange({ ...draft, status: event.target.value as SiteStatus })
          }
        >
          <option value={SiteStatus.DRAFT}>{t("statusDraft")}</option>
          <option value={SiteStatus.PUBLISHED}>{t("statusPublished")}</option>
          <option value={SiteStatus.PAUSED}>{t("statusPaused")}</option>
        </select>
      </Field>
      <Field label={t("minLead")} htmlFor="owner-lead">
        <Input
          id="owner-lead"
          type="number"
          min={0}
          value={draft.minLeadHours}
          onChange={(event) =>
            onChange({ ...draft, minLeadHours: Number(event.target.value) || 0 })
          }
        />
      </Field>
      <Field label={t("requestWindow")} htmlFor="owner-window">
        <Input
          id="owner-window"
          type="number"
          min={0}
          value={draft.requestWindowHours}
          onChange={(event) =>
            onChange({
              ...draft,
              requestWindowHours: Number(event.target.value) || 0,
            })
          }
        />
      </Field>
      <Field label={t("domain")} htmlFor="owner-domain">
        <Input
          id="owner-domain"
          value={draft.domain}
          onChange={(event) =>
            onChange({ ...draft, domain: event.target.value })
          }
        />
      </Field>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button type="button" isLoading={saving} disabled={!dirty} onClick={onSave}>
          {t("save")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={!dirty || saving}
          onClick={onDiscard}
        >
          {t("discard")}
        </Button>
      </div>
    </aside>
  );
}
