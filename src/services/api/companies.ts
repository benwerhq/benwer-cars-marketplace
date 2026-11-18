import { hasCompanyLogo } from "@/lib/companyLogos";
import type { Company, CompanyListFilters } from "@/types/company";
import { getOpenApiClient } from "./client";
import { applyCompanyListFilters } from "./filters";
import { mapCompany, mapCompanyList } from "./mappers";

async function fetchLiveCompanies(
  filters?: CompanyListFilters,
): Promise<Company[]> {
  const { data } = await getOpenApiClient().GET("/v1/public/companies", {
    params: {
      query: {
        q: filters?.q,
        location: filters?.location,
        from: filters?.from,
        to: filters?.to,
        cursor: filters?.cursor,
        limit: filters?.limit,
      },
    },
  });

  return applyCompanyListFilters(
    await enrichMissingLogos(mapCompanyList(data)),
    filters,
  );
}

async function enrichMissingLogos(companies: Company[]): Promise<Company[]> {
  return Promise.all(
    companies.map(async (company) => {
      if (hasCompanyLogo(company) || !company.slug) {
        return company;
      }

      try {
        const { data } = await getOpenApiClient().GET(
          "/v1/public/companies/{slug}",
          {
            params: { path: { slug: company.slug } },
          },
        );
        const detail = mapCompany(data);
        return hasCompanyLogo(detail) ? detail : company;
      } catch {
        return company;
      }
    }),
  );
}

export const companiesApi = {
  getAll(filters?: CompanyListFilters): Promise<Company[]> {
    return fetchLiveCompanies(filters);
  },

  getBySlug(slug: string): Promise<Company> {
    return getOpenApiClient()
      .GET("/v1/public/companies/{slug}", {
        params: { path: { slug } },
      })
      .then(({ data }) => mapCompany(data));
  },
};
