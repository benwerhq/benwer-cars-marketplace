import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Suspense } from "react";
import { headers } from "next/headers";
import { OwnerEditorViewProvider } from "@/context/OwnerEditorViewProvider";
import { StaffAuthProvider } from "@/context/StaffAuthProvider";
import { DocumentCorners } from "@/components/layout/DocumentCorners";
import { GuestVerifyBanner } from "@/components/layout/GuestVerifyBanner";
import { SitePreviewBanner } from "@/components/layout/SitePreviewBanner";
import {
  guestLinksFromHomeHref,
  isTenantHostRequest,
  publicSiteHomeHref,
} from "@/lib/site";
import { DEFAULT_PAGE_BACKGROUND, siteFontStack } from "@/lib/siteContent";
import { siteBrandColor } from "@/lib/websiteDraft";
import { SiteCornerStyle, SiteFontFamily } from "@/enums";
import { companyFaviconUrl } from "@/lib/companyLogos";
import { sitesApi } from "@/services/api";

interface Props {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const site = await sitesApi.getBySlug(slug);
    const name = site.company.name;
    const favicon = companyFaviconUrl(site.company.branding);
    return {
      title: {
        default: name,
        template: `%s | ${name}`,
      },
      ...(favicon
        ? {
            icons: {
              icon: [
                { url: favicon },
                { url: "/icon.png", type: "image/png", sizes: "512x512" },
              ],
              apple: favicon,
            },
          }
        : {}),
    };
  } catch {
    return {};
  }
}

async function SiteLayout({ children, params }: Props) {
  const { slug } = await params;
  const onTenantHost = isTenantHostRequest(await headers());
  const guestLinks = guestLinksFromHomeHref(
    publicSiteHomeHref(slug, onTenantHost),
  );
  let brandColor: string | null = null;
  let background = DEFAULT_PAGE_BACKGROUND;
  let font = SiteFontFamily.SANS;
  let corners = SiteCornerStyle.ROUND;
  try {
    const site = await sitesApi.getBySlug(slug);
    brandColor = siteBrandColor(site) || null;
    background = site.content.pageBackground;
    font = site.content.fontFamily;
    corners = site.content.cornerStyle;
  } catch {
    brandColor = null;
  }

  const style = {
    "--site-page-background": background,
    ...(brandColor ? { "--site-primary": brandColor } : {}),
    fontFamily: siteFontStack(font),
  } as CSSProperties;

  return (
    <StaffAuthProvider>
      <OwnerEditorViewProvider>
          <div
            style={style}
            data-corners={corners}
            data-brand={brandColor ? "" : undefined}
            className="site-canvas flex min-h-dvh flex-col bg-background"
          >
            <DocumentCorners corners={corners} />
            <GuestVerifyBanner
              profileHref={guestLinks.profile}
              bookingsHref={guestLinks.bookings}
            />
            <Suspense fallback={null}>
              <SitePreviewBanner />
            </Suspense>
            {children}
          </div>
        </OwnerEditorViewProvider>
      </StaffAuthProvider>
  );
}

export default SiteLayout;
