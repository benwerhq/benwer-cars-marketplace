import type { MetadataRoute } from "next";
import { companiesApi, vehiclesApi } from "@/services/api";
import { buildCompanySiteHref } from "@/lib/companySite";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/cars"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/companies"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/cookies"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  try {
    const companies = await companiesApi.getAll();
    const companyRoutes: MetadataRoute.Sitemap = companies.flatMap((company) => [
      {
        url: absoluteUrl(`/companies/${company.slug}`),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.8,
      },
      {
        url: buildCompanySiteHref({
          slug: company.slug,
          websiteUrl: company.websiteUrl,
        }),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.8,
      },
    ]);

    const vehicleRoutes: MetadataRoute.Sitemap = [];
    for (const company of companies) {
      try {
        const vehicles = await vehiclesApi.getByCompany(company.slug);
        for (const vehicle of vehicles) {
          vehicleRoutes.push({
            url: buildCompanySiteHref({
              slug: company.slug,
              websiteUrl: company.websiteUrl,
              path: `/cars/${encodeURIComponent(vehicle.id)}`,
            }),
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      } catch {
        /* skip a company whose fleet cannot be listed */
      }
    }

    return [...staticRoutes, ...companyRoutes, ...vehicleRoutes];
  } catch {
    return staticRoutes;
  }
}
