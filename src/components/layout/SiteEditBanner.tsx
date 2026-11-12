"use client";

import { useTranslations } from "next-intl";
import { useStaffAuth } from "@/context/StaffAuthProvider";

export function SiteEditBanner() {
  const t = useTranslations("site");
  const staff = useStaffAuth();

  if (!staff.ready || staff.user) {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-border bg-surface-muted px-4 py-1.5 text-center text-xs font-medium text-foreground"
    >
      {t("editBanner")}
    </div>
  );
}
