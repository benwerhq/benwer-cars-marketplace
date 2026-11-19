import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { previewFromQuery } from "@/lib/loadPublicSite";
import { isTenantHostRequest, publicSiteHomeHref } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Company sites have no cart: guests book one car at a time from its car page.
 * Old /cart links (bookmarks, emails) land on the site's home instead of a 404.
 */
export default async function CompanySiteCartRedirectPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const preview = previewFromQuery(query);
  const onTenantHost = isTenantHostRequest(await headers());
  redirect(publicSiteHomeHref(slug, onTenantHost, preview ? { preview } : undefined));
}
