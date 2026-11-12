import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { LegalArticle } from "@/components/layout/LegalArticle";
import { SiteGuestShell } from "@/components/layout/SiteGuestShell";
import { readLegalSections, splitLegalText } from "@/lib/legal";
import { loadPublicSite } from "@/lib/loadPublicSite";
import { localizedText } from "@/lib/localizedCopy";
import { buildPageMetadata } from "@/lib/seo";
import { siteHomePath } from "@/lib/site";

export type SiteLegalKind = "privacy" | "terms";

export async function siteLegalMetadata(
  slug: string,
  kind: SiteLegalKind,
  preview?: string,
): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations(`legal.${kind}`);
  let siteName = slug;
  let title = t("title");
  try {
    const site = await loadPublicSite(slug, preview);
    siteName = site.company.name;
    title = splitLegalText(localizedText(site.content.legal[kind], locale)).title || title;
  } catch {
    siteName = slug;
  }

  return buildPageMetadata({
    title,
    description: t("lede"),
    path: `${siteHomePath(slug)}/${kind}`,
    siteName,
    locale,
    noIndex: Boolean(preview),
  });
}

export async function SiteLegalPage({
  slug,
  kind,
  preview,
}: {
  slug: string;
  kind: SiteLegalKind;
  preview?: string;
}) {
  let site;
  try {
    site = await loadPublicSite(slug, preview);
  } catch {
    notFound();
  }

  const locale = await getLocale();
  const t = await getTranslations(`legal.${kind}`);
  const tSite = await getTranslations("siteLegal");
  const own = splitLegalText(localizedText(site.content.legal[kind], locale));
  const title = own.title || t("title");

  return (
    <SiteGuestShell site={site} preview={preview}>
      {own.body ? (
        <article className="flex flex-col gap-6">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">
              {tSite("byCompany", { name: site.company.name })}
            </p>
          </header>
          <div className="whitespace-pre-line text-sm leading-relaxed text-foreground">{own.body}</div>
        </article>
      ) : (
        <LegalArticle
          title={title}
          lede={t("lede")}
          updated={t("updated")}
          sections={readLegalSections(t.raw("sections"))}
        />
      )}
    </SiteGuestShell>
  );
}
