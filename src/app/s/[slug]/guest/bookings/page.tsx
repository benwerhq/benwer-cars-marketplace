import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { GuestBookingsView } from "@/components/features/GuestBookingsView";
import { SiteGuestShell } from "@/components/layout/SiteGuestShell";
import { loadPublicSite, previewFromQuery } from "@/lib/loadPublicSite";
import { companySlugFromSite, siteGuestBookingsPath } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("guest");
  const tBrand = await getTranslations("brand");

  return buildPageMetadata({
    title: t("bookingsTitle"),
    description: t("bookingsMeta"),
    path: siteGuestBookingsPath(slug),
    siteName: tBrand("name"),
    locale,
    noIndex: true,
  });
}

async function CompanySiteGuestBookingsPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const preview = previewFromQuery(query);

  let site;
  try {
    site = await loadPublicSite(slug, preview);
  } catch {
    notFound();
  }

  return (
    <SiteGuestShell site={site} preview={preview}>
      <GuestBookingsView
        slug={site.slug}
        companySlug={companySlugFromSite(site)}
        companyName={site.company.name}
      />
    </SiteGuestShell>
  );
}

export default CompanySiteGuestBookingsPage;
