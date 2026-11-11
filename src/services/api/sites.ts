import { ApiError } from "@/lib/errors";
import type { PublicSite, SiteQuery } from "@/types/site";
import { publicRequest } from "./client";
import { mapPublicSite } from "./mappers";

export const sitesApi = {
  async getBySlug(slug: string, query?: SiteQuery): Promise<PublicSite> {
    const data = await publicRequest<unknown>(
      `/v1/public/sites/${encodeURIComponent(slug)}`,
      { query: { preview: query?.preview } },
    );
    const site = mapPublicSite(data, slug);
    if (!site.slug) {
      throw new ApiError(404, "site.not_found");
    }
    return site;
  },
};
