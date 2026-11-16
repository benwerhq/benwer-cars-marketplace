import type { PublicChannel } from "@/enums";
import { mapExtras, type PublicExtra } from "@/lib/extras";
import { publicRequest } from "./client";

export const extrasApi = {
  async list(companySlug: string, channel?: PublicChannel): Promise<PublicExtra[]> {
    const data = await publicRequest<unknown>(
      `/v1/public/companies/${encodeURIComponent(companySlug)}/extras`,
      { query: { channel } },
    );
    return mapExtras(data);
  },
};
