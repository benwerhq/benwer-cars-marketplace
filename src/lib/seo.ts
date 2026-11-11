import type { Metadata } from "next";
import { env } from "@/env";
import type { Vehicle } from "@/types/vehicle";

export function getSiteUrl(): string {
  return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") {
    return base;
  }

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function openGraphLocale(locale: string): string {
  return locale.replace("-", "_");
}

interface PageMetadataInput {
  title: string;
  description: string;
  path?: string;
  siteName: string;
  locale: string;
  images?: string[];
  noIndex?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  siteName,
  locale,
  images,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const ogImages = images?.filter(Boolean).map((image) => ({ url: image }));

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName,
      locale: openGraphLocale(locale),
      images: ogImages && ogImages.length > 0 ? ogImages : undefined,
    },
    twitter: {
      card: ogImages && ogImages.length > 0 ? "summary_large_image" : "summary",
      title,
      description,
      images: images && images.length > 0 ? images : undefined,
    },
  };
}

export function jsonLdString(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function websiteJsonLd(input: {
  name: string;
  description: string;
}): Record<string, unknown> {
  const url = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: input.name,
        url,
        description: input.description,
      },
      {
        "@type": "WebSite",
        name: input.name,
        url,
        description: input.description,
        inLanguage: ["en-GB", "es-ES", "pt-PT"],
      },
    ],
  };
}

export function carProductJsonLd(input: {
  vehicle: Vehicle;
  companyName: string;
  description: string;
  url: string;
}): Record<string, unknown> {
  const { vehicle, companyName, description, url } = input;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${vehicle.brand} ${vehicle.model}`,
    description,
    image: vehicle.photos,
    brand: {
      "@type": "Brand",
      name: vehicle.brand,
    },
    offers: {
      "@type": "Offer",
      price: vehicle.pricePerDay,
      priceCurrency: vehicle.currency,
      availability: "https://schema.org/InStock",
      url,
    },
    provider: {
      "@type": "AutoRental",
      name: companyName,
    },
  };
}
