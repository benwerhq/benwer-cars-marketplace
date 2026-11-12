import type { ReactNode } from "react";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { isTenantHostRequest, publicSiteHomeHref } from "@/lib/site";
import type { PublicSite } from "@/types/site";
import { siteHeaderLogo } from "@/lib/siteContent";

interface SiteGuestShellProps {
  site: PublicSite;
  preview?: string;
  children: ReactNode;
}

export async function SiteGuestShell({
  site,
  preview,
  children,
}: SiteGuestShellProps) {
  const onTenantHost = isTenantHostRequest(await headers());
  const homeHref = publicSiteHomeHref(site.slug, onTenantHost, { preview });

  return (
    <>
      <SiteHeader
        companyName={site.company.name}
        logoUrl={siteHeaderLogo(site.content, site.company.branding.logoUrl)}
        homeHref={homeHref}
        cartSlug={site.slug}
        fleetHref={`${homeHref}#fleet`}
      />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 md:px-6">
        {children}
      </main>
      <SiteFooter companyName={site.company.name} homeHref={homeHref} />
    </>
  );
}
