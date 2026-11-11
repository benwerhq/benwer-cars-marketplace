import type { CSSProperties, ReactNode } from "react";
import { Suspense } from "react";
import { StaffAuthProvider } from "@/context/StaffAuthProvider";
import { SitePreviewBanner } from "@/components/layout/SitePreviewBanner";
import { sitesApi } from "@/services/api";

interface Props {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

async function SiteLayout({ children, params }: Props) {
  const { slug } = await params;
  let brandColor: string | null = null;
  try {
    const site = await sitesApi.getBySlug(slug);
    brandColor = site.company.branding.primaryColor || null;
  } catch {
    brandColor = null;
  }

  const style = brandColor
    ? ({ "--primary": brandColor } as CSSProperties)
    : undefined;

  return (
    <StaffAuthProvider>
      <div style={style} className="flex min-h-dvh flex-col">
        <Suspense fallback={null}>
          <SitePreviewBanner />
        </Suspense>
        {children}
      </div>
    </StaffAuthProvider>
  );
}

export default SiteLayout;
