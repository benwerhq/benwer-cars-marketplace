"use client";

import type { SiteCornerStyle } from "@/enums";
import { useDocumentCorners } from "@/hooks/useDocumentCorners";

export function DocumentCorners({ corners }: { corners: SiteCornerStyle }) {
  useDocumentCorners(corners);
  return null;
}
