import {
  getCityBySlug,
  getCityDisplayName,
  isProvinceWideLocation,
} from "@/data/malagaCities";
import type { Company } from "@/types/company";

export interface InventoryLocation {
  slug: string;
  label: string;
}

export function slugifyLocation(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function locationLabelFromSlug(
  slug: string,
  locale: string,
  fallback?: string | null,
): string {
  const city = getCityBySlug(slug);
  if (city) {
    return getCityDisplayName(city, locale);
  }

  if (fallback?.trim()) {
    return fallback.trim();
  }

  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function inventoryLocationsFromCompanies(
  companies: Company[],
  locale: string,
): InventoryLocation[] {
  const bySlug = new Map<string, string>();

  for (const company of companies) {
    if (company.vehicleCount === 0) {
      continue;
    }

    const slug =
      company.locationSlug ??
      (company.location ? slugifyLocation(company.location) : "");
    if (!slug || isProvinceWideLocation(slug)) {
      continue;
    }

    if (!bySlug.has(slug)) {
      bySlug.set(slug, locationLabelFromSlug(slug, locale, company.location));
    }
  }

  return [...bySlug.entries()]
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) =>
      a.label.localeCompare(
        b.label,
        locale === "es-ES" ? "es" : locale === "pt-PT" ? "pt" : "en",
      ),
    );
}

export function filterInventoryLocations(
  locations: InventoryLocation[],
  query: string,
): InventoryLocation[] {
  const normalized = query
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
  if (!normalized) {
    return locations;
  }

  return locations.filter(
    (location) =>
      location.label
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .includes(normalized) || location.slug.includes(normalized),
  );
}
