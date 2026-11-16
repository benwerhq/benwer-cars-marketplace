import { headers } from "next/headers";
import type { CSSProperties } from "react";
import { companiesApi } from "@/services/api";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const companySlug = headersList.get("x-company-slug");

  if (!companySlug) {
    return <>{children}</>;
  }

  let brandColor: string | null = null;
  try {
    const company = await companiesApi.getBySlug(companySlug);
    brandColor = company.branding.primaryColor;
  } catch {
    /* keep default primary color */
  }

  const style = brandColor
    ? ({ "--site-primary": brandColor } as CSSProperties)
    : undefined;

  return (
    <div style={style} data-brand={brandColor ? "" : undefined}>
      {children}
    </div>
  );
}
