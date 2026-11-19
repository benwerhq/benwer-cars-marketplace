import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { LegalArticle } from "@/components/layout/LegalArticle";
import { SiteGuestShell } from "@/components/layout/SiteGuestShell";
import { parseLegalBlocks, readLegalSections, splitLegalText } from "@/lib/legal";
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
  const tSite = await getTranslations("siteLegal");
  let siteName = slug;
  let title = t("title");
  let description = tSite(`missing.${kind}`, { name: slug });
  try {
    const site = await loadPublicSite(slug, preview);
    siteName = site.company.name;
    const own = splitLegalText(localizedText(site.content.legal[kind], locale));
    title = own.title || title;
    description = own.body
      ? parseLegalBlocks(own.body).intro || title
      : tSite(`missing.${kind}`, { name: siteName });
  } catch {
    siteName = slug;
  }

  return buildPageMetadata({
    title,
    description,
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
        <LegalArticle
          title={title}
          lede={parseLegalBlocks(own.body).intro}
          updated={tSite("byCompany", { name: site.company.name })}
          sections={parseLegalBlocks(own.body).sections}
        />
      ) : (
        // The company has not published its own text: never show the marketplace's policy here.
        <LegalArticle
          title={title}
          lede={tSite(`missing.${kind}`, { name: site.company.name })}
          updated={tSite("byCompany", { name: site.company.name })}
          sections={[
            {
              title: tSite("missing.contactTitle"),
              body: tSite("missing.contactBody", { name: site.company.name }),
            },
          ]}
        />
      )}
    </SiteGuestShell>
  );
}

export async function siteCookiesMetadata(slug: string, preview?: string): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("siteLegal.cookies");
  let siteName = slug;
  try {
    siteName = (await loadPublicSite(slug, preview)).company.name;
  } catch {
    siteName = slug;
  }

  return buildPageMetadata({
    title: t("title"),
    description: t("lede", { name: siteName }),
    path: `${siteHomePath(slug)}/cookies`,
    siteName,
    locale,
    noIndex: Boolean(preview),
  });
}

export async function SiteCookiesPage({ slug, preview }: { slug: string; preview?: string }) {
  let site;
  try {
    site = await loadPublicSite(slug, preview);
  } catch {
    notFound();
  }

  const t = await getTranslations("siteLegal.cookies");
  const name = site.company.name;

  return (
    <SiteGuestShell site={site} preview={preview}>
      <LegalArticle
        title={t("title")}
        lede={t("lede", { name })}
        updated={t("updated", { name })}
        sections={readLegalSections(t.raw("sections")).map((section) => ({
          title: section.title.replaceAll("{name}", name),
          body: section.body.replaceAll("{name}", name),
        }))}
      />
    </SiteGuestShell>
  );
}
