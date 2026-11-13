"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

interface LoadMoreCarsProps {
  shown: number;
  total: number;
  onLoadMore: () => void;
}

export function LoadMoreCars({ shown, total, onLoadMore }: LoadMoreCarsProps) {
  const t = useTranslations("cars");

  if (shown >= total) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {t("showingOf", { shown, total })}
      </p>
      <Button type="button" variant="secondary" onClick={onLoadMore}>
        {t("loadMore")}
      </Button>
    </div>
  );
}
