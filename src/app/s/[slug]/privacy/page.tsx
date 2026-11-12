import type { Metadata } from "next";
import { SiteLegalPage, siteLegalMetadata } from "@/components/features/SiteLegalPage";
import { previewFromQuery } from "@/lib/loadPublicSite";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return siteLegalMetadata(slug, "privacy", previewFromQuery(query));
}

async function CompanySitePrivacyPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  return <SiteLegalPage slug={slug} kind="privacy" preview={previewFromQuery(query)} />;
}

export default CompanySitePrivacyPage;
