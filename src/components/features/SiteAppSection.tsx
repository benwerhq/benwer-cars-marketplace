"use client";

import { useLocale, useTranslations } from "next-intl";
import { StoreBadges } from "@/components/layout/StoreBadges";
import { Badge } from "@/components/ui/Badge";
import { QrCode } from "@/components/ui/QrCode";
import { SiteSectionId } from "@/enums";
import { localizedText } from "@/lib/localizedCopy";
import { appQrTarget, siteAppLinks } from "@/lib/siteContent";
import type { SiteAppContent } from "@/types/siteContent";
import { SiteSectionHeading } from "./SiteSectionHeading";

export function SiteAppSection({
  app,
  appLinkUrl = null,
}: {
  app: SiteAppContent;
  appLinkUrl?: string | null;
}) {
  const t = useTranslations("siteSections.app");
  const locale = useLocale();
  const headingId = `${SiteSectionId.APP}-heading`;
  const { iosUrl, androidUrl } = siteAppLinks(app);
  const platform =
    iosUrl && androidUrl
      ? t("platformBoth")
      : androidUrl
        ? t("platformAndroid")
        : t("platformIos");
  const qrTarget = appQrTarget(app, appLinkUrl);

  return (
    <section
      id={SiteSectionId.APP}
      aria-labelledby={headingId}
      className="flex scroll-mt-24 flex-col gap-8"
    >
      <SiteSectionHeading
        id={headingId}
        eyebrow={t("eyebrow")}
        title={localizedText(app.title, locale) || t("title")}
      />
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
        <div className="min-w-0">
          <Badge variant="info">{platform}</Badge>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {localizedText(app.text, locale) || t("text")}
          </p>
          <StoreBadges
            className="mt-5"
            appStore={{
              prefix: t("appStore.prefix"),
              name: t("appStore.name"),
              aria: iosUrl ? t("appStore.aria") : t("appStore.unavailable"),
              href: iosUrl || undefined,
            }}
            googlePlay={{
              prefix: t("googlePlay.prefix"),
              name: t("googlePlay.name"),
              aria: androidUrl ? t("googlePlay.aria") : t("googlePlay.unavailable"),
              href: androidUrl || undefined,
            }}
          />
        </div>
        {qrTarget ? (
          <figure className="hidden shrink-0 flex-col items-center gap-2 border-l border-border pl-8 sm:flex">
            <div className="rounded-xl border border-border bg-surface p-2">
              <QrCode value={qrTarget} label={t("qrAlt")} className="h-32 w-32" />
            </div>
            <figcaption className="text-xs font-medium text-muted-foreground">{t("scan")}</figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
