import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { siteHomePath, withSiteQuery } from "@/lib/site";
import type { PublicSite } from "@/types/site";

interface SiteGuestShellProps {
  site: PublicSite;
  preview?: string;
  children: ReactNode;
}

export function SiteGuestShell({
  site,
  preview,
  children,
}: SiteGuestShellProps) {
  const homeHref = withSiteQuery(siteHomePath(site.slug), { preview });

  return (
    <>
      <SiteHeader
        companyName={site.company.name}
        logoUrl={site.company.branding.logoUrl}
        homeHref={homeHref}
        fleetHref={`${homeHref}#fleet`}
      />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 md:px-6">
        {children}
      </main>
      <SiteFooter companyName={site.company.name} homeHref={homeHref} />
    </>
  );
}
