import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { MarketplaceHeader } from "@/components/layout/MarketplaceHeader";
import { Footer } from "@/components/layout/Footer";
import { PageIntro } from "@/components/layout/PageIntro";
import { CompanyListView } from "@/components/features/CompanyListView";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("companies");
  const tBrand = await getTranslations("brand");

  return buildPageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: "/companies",
    siteName: tBrand("name"),
    locale,
  });
}

async function CompaniesPage() {
  const t = await getTranslations("companies");

  return (
    <>
      <MarketplaceHeader />
      <main className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">
        <PageIntro title={t("title")} description={t("subtitle")} />
        <CompanyListView />
      </main>
      <Footer />
    </>
  );
}

export default CompaniesPage;
