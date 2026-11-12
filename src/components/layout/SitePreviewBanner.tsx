"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useOwnerEditorView } from "@/context/OwnerEditorViewProvider";
import { useStaffAuth } from "@/context/StaffAuthProvider";
import { SearchParams } from "@/enums";
import { ownerTokenFromHash } from "@/lib/staffFirebase";

export function SitePreviewBanner() {
  const t = useTranslations("site");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const staff = useStaffAuth();
  const { editorOpen, previewing } = useOwnerEditorView();
  const preview = searchParams.get(SearchParams.PREVIEW);
  const owner = Boolean(staff.user);

  useEffect(() => {
    if (!preview || !staff.ready || owner || ownerTokenFromHash(window.location.hash)) {
      return;
    }
    const next = new URLSearchParams(searchParams.toString());
    next.delete(SearchParams.PREVIEW);
    next.delete(SearchParams.EDIT);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [preview, staff.ready, owner, searchParams, pathname, router]);

  if (!staff.ready || !owner || editorOpen || !(preview || previewing)) {
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
