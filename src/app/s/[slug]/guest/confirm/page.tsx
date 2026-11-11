import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { GuestConfirmView } from "@/components/features/GuestConfirmView";
import { SiteGuestShell } from "@/components/layout/SiteGuestShell";
import { SearchParams } from "@/enums";
import { parseGuestConfirmToken } from "@/lib/guestAccount";
import { loadPublicSite, previewFromQuery } from "@/lib/loadPublicSite";
import {
  companySlugFromSite,
  siteGuestBookingsPath,
  siteGuestConfirmPath,
  withSiteQuery,
} from "@/lib/site";
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
    title: t("confirmTitle"),
    description: t("confirmHint"),
    path: siteGuestConfirmPath(slug),
    siteName: tBrand("name"),
    locale,
    noIndex: true,
  });
}

async function CompanySiteGuestConfirmPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const preview = previewFromQuery(query);
  const token = parseGuestConfirmToken(query[SearchParams.TOKEN]);

  let site;
  try {
    site = await loadPublicSite(slug, preview);
  } catch {
    notFound();
  }

  const bookingsHref = withSiteQuery(siteGuestBookingsPath(site.slug), {
    preview,
  });

  return (
    <SiteGuestShell site={site} preview={preview}>
      <GuestConfirmView
        companySlug={companySlugFromSite(site)}
        token={token}
        bookingsHref={bookingsHref}
      />
    </SiteGuestShell>
  );
}

export default CompanySiteGuestConfirmPage;
