import type { Metadata } from "next";
import { BellRing, CalendarCheck, Smartphone, type LucideIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { GuestAppStoreBadges } from "@/components/features/GuestAppBadges";
import { MarketplaceHeader } from "@/components/layout/MarketplaceHeader";
import { Footer } from "@/components/layout/Footer";
import { EmptyState } from "@/components/ui/EmptyState";
import { QrCode } from "@/components/ui/QrCode";
import { NavRoutes } from "@/enums";
import { guestAppStoreLinks, hasGuestAppStoreLinks } from "@/lib/guestApp";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("guestApp");
  const tBrand = await getTranslations("brand");

  return buildPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: NavRoutes.APP,
    siteName: tBrand("name"),
    locale,
  });
}

async function GuestAppPage() {
  const t = await getTranslations("guestApp");
  const tSite = await getTranslations("siteSections.app");
  const available = hasGuestAppStoreLinks(guestAppStoreLinks());
  const features: { icon: LucideIcon; label: string }[] = [
    { icon: Smartphone, label: t("featureTrips") },
    { icon: CalendarCheck, label: t("featureBooking") },
    { icon: BellRing, label: t("featurePush") },
  ];

  return (
    <>
      <MarketplaceHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-12 md:px-6 md:py-16">
        {available ? (
          <section
            aria-labelledby="guest-app-title"
            className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0 max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                {t("eyebrow")}
              </p>
              <h1
                id="guest-app-title"
                className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl"
              >
                {t("title")}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {t("description")}
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {features.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 text-sm text-foreground">
                    <Icon size={18} aria-hidden className="shrink-0 text-primary" />
                    {label}
                  </li>
                ))}
              </ul>
              <GuestAppStoreBadges className="mt-8" />
            </div>
            <figure className="hidden shrink-0 flex-col items-center gap-2 md:flex">
              <div className="rounded-xl border border-border bg-surface p-3">
                <QrCode
                  value={absoluteUrl(NavRoutes.APP)}
                  label={tSite("qrAlt")}
                  className="h-40 w-40"
                />
              </div>
              <figcaption className="text-xs font-medium text-muted-foreground">
                {tSite("scan")}
              </figcaption>
            </figure>
          </section>
        ) : (
          <EmptyState
            icon={<Smartphone size={28} />}
            title={t("unavailableTitle")}
            description={t("unavailableDescription")}
            actionLabel={t("browse")}
            actionHref={NavRoutes.CARS}
          />
        )}
      </main>
      <Footer />
    </>
  );
}

export default GuestAppPage;
