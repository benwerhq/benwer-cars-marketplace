import type { Metadata } from "next";
import { SiteCookiesPage, siteCookiesMetadata } from "@/components/features/SiteLegalPage";
import { previewFromQuery } from "@/lib/loadPublicSite";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return siteCookiesMetadata(slug, previewFromQuery(query));
}

async function CompanySiteCookiesPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return <SiteCookiesPage slug={slug} preview={previewFromQuery(query)} />;
}

export default CompanySiteCookiesPage;
