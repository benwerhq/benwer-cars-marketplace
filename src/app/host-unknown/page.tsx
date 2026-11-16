import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("hostUnknown");
  const tBrand = await getTranslations("brand");

  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/host-unknown",
    siteName: tBrand("name"),
    locale,
    noIndex: true,
  });
}

async function HostUnknownPage() {
  const t = await getTranslations("hostUnknown");

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-16">
      <EmptyState title={t("title")} description={t("description")} />
    </main>
  );
}

export default HostUnknownPage;
