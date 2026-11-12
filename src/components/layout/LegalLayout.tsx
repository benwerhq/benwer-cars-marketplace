import type { ReactNode } from "react";
import { headers } from "next/headers";
import { MarketplaceHeader } from "./MarketplaceHeader";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { Footer } from "./Footer";
import { loadPublicSite } from "@/lib/loadPublicSite";
import { publicSiteHomeHref } from "@/lib/site";
import { siteHeaderLogo } from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import type { PublicSite } from "@/types/site";

interface LegalLayoutProps {
  children: ReactNode;
  width?: "article" | "form";
}

export async function LegalLayout({
  children,
  width = "article",
}: LegalLayoutProps) {
  const tenantSlug = (await headers()).get("x-company-slug");
  const site = tenantSlug ? await loadSiteOrNull(tenantSlug) : null;
  const homeHref = tenantSlug ? publicSiteHomeHref(tenantSlug, true) : null;
  const companyName = site?.company.name ?? tenantSlug ?? "";

  return (
    <>
      {homeHref ? (
        <SiteHeader
          companyName={companyName}
          logoUrl={
            site
              ? siteHeaderLogo(site.content, site.company.branding.logoUrl)
              : null
          }
          homeHref={homeHref}
          fleetHref={`${homeHref}#fleet`}
        />
      ) : (
        <MarketplaceHeader />
      )}
      <main
        className={cn(
          "mx-auto w-full flex-1 px-4 py-10 md:px-6 md:py-14 lg:px-8",
          width === "form" ? "max-w-xl" : "max-w-3xl",
        )}
      >
        {children}
      </main>
      {homeHref ? (
        <SiteFooter
          companyName={companyName}
          homeHref={homeHref}
          description={site?.company.description}
        />
      ) : (
        <Footer />
      )}
    </>
  );
}

async function loadSiteOrNull(slug: string): Promise<PublicSite | null> {
  try {
    return await loadPublicSite(slug);
  } catch {
    return null;
  }
}
