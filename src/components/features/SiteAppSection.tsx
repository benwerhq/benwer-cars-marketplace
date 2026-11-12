"use client";

import { Smartphone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { StoreBadges } from "@/components/layout/StoreBadges";
import { Badge } from "@/components/ui/Badge";
import { QrCode } from "@/components/ui/QrCode";
import { SiteSectionId } from "@/enums";
import { localizedText } from "@/lib/localizedCopy";
import { appQrTarget } from "@/lib/siteContent";
import type { SiteAppContent } from "@/types/siteContent";

export function SiteAppSection({ app }: { app: SiteAppContent }) {
  const t = useTranslations("siteSections.app");
  const locale = useLocale();
  const headingId = `${SiteSectionId.APP}-heading`;
  const platform =
    app.iosUrl && app.androidUrl
      ? t("platformBoth")
      : app.androidUrl
        ? t("platformAndroid")
        : app.iosUrl
          ? t("platformIos")
          : t("comingSoon");
  const qrTarget = appQrTarget(app);

  return (
    <section
      id={SiteSectionId.APP}
      aria-labelledby={headingId}
      className="flex scroll-mt-24 flex-col gap-6 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between md:p-8"
    >
      <div className="flex gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Smartphone size={22} aria-hidden />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={headingId} className="text-base font-semibold text-foreground">
              {localizedText(app.title, locale) || t("title")}
            </h2>
            <Badge variant="info">{platform}</Badge>
          </div>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {localizedText(app.text, locale) || t("text")}
          </p>
          <StoreBadges
            className="mt-4"
            appStore={{
              prefix: t("appStore.prefix"),
              name: t("appStore.name"),
              aria: app.iosUrl ? t("appStore.aria") : t("appStore.unavailable"),
              href: app.iosUrl || undefined,
            }}
            googlePlay={{
              prefix: t("googlePlay.prefix"),
              name: t("googlePlay.name"),
              aria: app.androidUrl ? t("googlePlay.aria") : t("googlePlay.unavailable"),
              href: app.androidUrl || undefined,
            }}
          />
        </div>
      </div>
      {qrTarget ? (
        <figure className="hidden shrink-0 flex-col items-center gap-2 border-l border-border pl-8 sm:flex">
          <div className="rounded-xl border border-border bg-surface p-2">
            <QrCode value={qrTarget} label={t("qrAlt")} className="h-24 w-24" />
          </div>
          <figcaption className="text-xs text-muted-foreground">{t("scan")}</figcaption>
        </figure>
      ) : null}
    </section>
  );
}
