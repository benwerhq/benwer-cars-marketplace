"use client";

import { UserRoundX } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/EmptyState";

export function GuestDisabledState() {
  const t = useTranslations("guest");

  return (
    <EmptyState
      icon={<UserRoundX size={28} />}
      title={t("disabledTitle")}
      description={t("disabledDescription")}
    />
  );
}
