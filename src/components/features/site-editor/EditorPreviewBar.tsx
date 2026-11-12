"use client";

import { PencilLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SiteStatus } from "@/enums";
import type { WebsiteSettings } from "@/types/websiteSettings";
import { STATUS_BADGE } from "./SiteEditor";

interface EditorPreviewBarProps {
  draft: WebsiteSettings;
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  error?: string | null;
  onEdit: () => void;
  onSave: () => void;
  onPublish: () => void;
}

export function EditorPreviewBar({
  draft,
  dirty,
  saving,
  publishing,
  error,
  onEdit,
  onSave,
  onPublish,
}: EditorPreviewBarProps) {
  const t = useTranslations("siteEditor");
  const canPublish =
    draft.canPublish && !(draft.status === SiteStatus.PUBLISHED && !draft.hasUnpublishedChanges);

  return (
    <div
      role="region"
      aria-label={t("previewBarAria")}
      className="fixed inset-x-4 bottom-4 z-50 font-sans mx-auto flex max-w-xl flex-col gap-2 rounded-2xl border border-border bg-surface p-3 shadow-xl sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-2 px-1">
        <Badge variant={STATUS_BADGE[draft.status]} dot>
          {t(`status.${draft.status}`)}
        </Badge>
        <p className="truncate text-xs text-muted-foreground" aria-live="polite">
          {error ??
            (dirty
              ? t("unsaved")
              : draft.hasUnpublishedChanges
                ? t("savedNotPublished")
                : t("previewing"))}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onEdit}>
          <PencilLine size={14} aria-hidden />
          {t("backToEdit")}
        </Button>
        {dirty ? (
          <Button type="button" size="sm" isLoading={saving} onClick={onSave}>
            {t("save")}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            isLoading={publishing}
            disabled={!canPublish}
            onClick={onPublish}
          >
            {t("publish")}
          </Button>
        )}
      </div>
    </div>
  );
}
