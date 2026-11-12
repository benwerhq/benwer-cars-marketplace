"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useStaffAuth } from "@/context/StaffAuthProvider";
import { SearchParams } from "@/enums";

export function SitePreviewBanner() {
  const t = useTranslations("site");
  const searchParams = useSearchParams();
  const preview = searchParams.get(SearchParams.PREVIEW);
  const editing = searchParams.get(SearchParams.EDIT) === "1";
  const staff = useStaffAuth();

  if (!preview || editing || !staff.ready || staff.user) {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-warning/30 bg-warning-soft px-4 py-2 text-center text-sm text-foreground"
    >
      {t("previewBanner")}
    </div>
  );
}
