"use client";

import { PauseCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";

interface SitePausedNoticeProps {
  compact?: boolean;
}

export function SitePausedNotice({ compact = false }: SitePausedNoticeProps) {
  const t = useTranslations("site");

  return (
    <EmptyState
      icon={<PauseCircle size={compact ? 22 : 28} />}
      title={t("pausedTitle")}
      description={t("pausedDescription")}
      variant={compact ? "compact" : "page"}
    />
  );
}
