import { getTranslations } from "next-intl/server";

export async function SiteEditBanner() {
  const t = await getTranslations("site");

  return (
    <div
      role="status"
      className="border-b border-border bg-surface-muted px-4 py-1.5 text-center text-xs font-medium text-foreground"
    >
      {t("editBanner")}
    </div>
  );
}
