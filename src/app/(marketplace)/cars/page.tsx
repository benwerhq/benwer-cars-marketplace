import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { MarketplaceHeader } from "@/components/layout/MarketplaceHeader";
import { Footer } from "@/components/layout/Footer";
import { MarketplaceCarListView } from "@/components/features/MarketplaceCarListView";
import { MarketplaceHeroSearch } from "@/components/features/MarketplaceHeroSearch";
import { PageIntro } from "@/components/layout/PageIntro";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("home");
  const tBrand = await getTranslations("brand");

  return buildPageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: "/cars",
    siteName: tBrand("name"),
    locale,
  });
}

async function CarsSearchPage() {
  const t = await getTranslations("cars");

  return (
    <>
      <MarketplaceHeader />
      <main className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">
        <PageIntro title={t("title")} description={t("subtitle")} />
        <MarketplaceHeroSearch />
        <MarketplaceCarListView />
      </main>
      <Footer />
    </>
  );
}

export default CarsSearchPage;
