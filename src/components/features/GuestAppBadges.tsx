import { getTranslations } from "next-intl/server";
import { StoreBadges } from "@/components/layout/StoreBadges";
import { guestAppStoreLinks, hasGuestAppStoreLinks } from "@/lib/guestApp";
import { cn } from "@/lib/utils";

export async function GuestAppStoreBadges({ className }: { className?: string }) {
  const t = await getTranslations("siteSections.app");
  const links = guestAppStoreLinks();
  if (!hasGuestAppStoreLinks(links)) {
    return null;
  }

  return (
    <StoreBadges
      className={className}
      appStore={
        links.iosUrl
          ? {
              prefix: t("appStore.prefix"),
              name: t("appStore.name"),
              aria: t("appStore.aria"),
              href: links.iosUrl,
            }
          : undefined
      }
      googlePlay={
        links.androidUrl
          ? {
              prefix: t("googlePlay.prefix"),
              name: t("googlePlay.name"),
              aria: t("googlePlay.aria"),
              href: links.androidUrl,
            }
          : undefined
      }
    />
  );
}

export async function GuestAppBadges({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const t = await getTranslations("guestApp");
  if (!hasGuestAppStoreLinks(guestAppStoreLinks())) {
    return null;
  }

  return (
    <aside
      aria-labelledby="guest-app-badges-title"
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 id="guest-app-badges-title" className="text-base font-semibold text-foreground">
          {t("badgeTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </div>
      <GuestAppStoreBadges className="shrink-0" />
    </aside>
  );
}
