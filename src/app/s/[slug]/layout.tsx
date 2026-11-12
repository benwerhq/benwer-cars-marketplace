import type { CSSProperties, ReactNode } from "react";
import { Suspense } from "react";
import { GuestAuthProvider } from "@/context/GuestAuthProvider";
import { StaffAuthProvider } from "@/context/StaffAuthProvider";
import { SitePreviewBanner } from "@/components/layout/SitePreviewBanner";
import { DEFAULT_PAGE_BACKGROUND, siteFontStack } from "@/lib/siteContent";
import { siteBrandColor } from "@/lib/websiteDraft";
import { SiteFontFamily } from "@/enums";
import { sitesApi } from "@/services/api";

interface Props {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

async function SiteLayout({ children, params }: Props) {
  const { slug } = await params;
  let brandColor: string | null = null;
  let background = DEFAULT_PAGE_BACKGROUND;
  let font = SiteFontFamily.SANS;
  try {
    const site = await sitesApi.getBySlug(slug);
    brandColor = siteBrandColor(site) || null;
    background = site.content.pageBackground;
    font = site.content.fontFamily;
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
        <div style={style} className="flex min-h-dvh flex-col bg-background">
          <Suspense fallback={null}>
            <SitePreviewBanner />
          </Suspense>
          {children}
        </div>
      </StaffAuthProvider>
    </GuestAuthProvider>
  );
}

export default SiteLayout;
