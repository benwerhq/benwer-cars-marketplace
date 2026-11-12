import type { CSSProperties, ReactNode } from "react";
import { Suspense } from "react";
import { headers } from "next/headers";
import { GuestAuthProvider } from "@/context/GuestAuthProvider";
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
import { sitesApi } from "@/services/api";

interface Props {
  children: ReactNode;
  params: Promise<{ slug: string }>;
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
    "--background": background,
    ...(brandColor ? { "--primary": brandColor } : {}),
    fontFamily: siteFontStack(font),
  } as CSSProperties;

  return (
    <GuestAuthProvider>
      <StaffAuthProvider>
        <OwnerEditorViewProvider>
          <div
            style={style}
            data-corners={corners}
            className="flex min-h-dvh flex-col bg-background"
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
    </GuestAuthProvider>
  );
}

export default SiteLayout;
