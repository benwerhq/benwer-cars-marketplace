import { sitesApi } from "@/services/api";
import type { PublicSite } from "@/types/site";

export async function loadPublicSite(
  slug: string,
  preview?: string,
): Promise<PublicSite> {
  return sitesApi.getBySlug(slug, { preview });
}

export function previewFromQuery(
  query: Record<string, string | string[] | undefined>,
): string | undefined {
  const value = query.preview;
  return Array.isArray(value) ? value[0] : value;
}
