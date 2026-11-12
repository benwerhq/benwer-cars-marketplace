import { ApiError } from "@/lib/errors";
import { channelQuery } from "@/lib/publicChannel";
import type { PublicChannel } from "@/enums";
import type {
  MarketplaceSearchFilters,
  MarketplaceVehicle,
  Vehicle,
  VehicleFilters,
} from "@/types/vehicle";
import { getOpenApiClient, publicRequest } from "./client";
import { companiesApi } from "./companies";
import { applyVehicleListFilters } from "./filters";
import { mapVehicle, mapVehicleList } from "./mappers";

function decodeVehicleId(id: string): string {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

async function fetchLiveVehicles(
  companySlug: string,
  filters?: VehicleFilters,
): Promise<Vehicle[]> {
  const channel = filters?.channel;
  // With dates the API prices each car for that stay, as checkout does.
  const stay =
    filters?.from && filters?.to ? { from: filters.from, to: filters.to } : {};
  const data =
    channel || stay.from
    ? await publicRequest<unknown>(
        `/v1/public/companies/${encodeURIComponent(companySlug)}/vehicles`,
        { query: { ...channelQuery(channel), ...stay } },
      )
    : (
        await getOpenApiClient().GET("/v1/public/companies/{slug}/vehicles", {
          params: { path: { slug: companySlug } },
        })
      ).data;

  return applyVehicleListFilters(
    mapVehicleList(data, { companySlug }),
    filters,
  );
}

async function fetchLiveVehicle(
  companySlug: string,
  vehicleId: string,
  channel?: PublicChannel,
): Promise<Vehicle> {
  try {
    const data = channel
      ? await publicRequest<unknown>(
          `/v1/public/companies/${encodeURIComponent(companySlug)}/vehicles/${encodeURIComponent(vehicleId)}`,
          { query: channelQuery(channel) },
        )
      : (
          await getOpenApiClient().GET(
            "/v1/public/companies/{slug}/vehicles/{id}",
            {
              params: { path: { slug: companySlug, id: vehicleId } },
            },
          )
        ).data;
    const vehicle = mapVehicle(data, { companySlug });
    if (!vehicle.id) {
      throw new ApiError(404, "vehicle.not_found");
    }
    return vehicle;
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      (error.status !== 404 && error.code !== "vehicle.not_found")
    ) {
      throw error;
    }

    try {
      const listed = await fetchLiveVehicles(companySlug, { channel });
      const found = listed.find((vehicle) => vehicle.id === vehicleId);
      if (found) {
        return found;
      }
    } catch {
      throw error;
    }

    throw error;
  }
}

export const vehiclesApi = {
  getByCompany(
    companySlug: string,
    filters?: VehicleFilters,
  ): Promise<Vehicle[]> {
    return fetchLiveVehicles(companySlug, filters);
  },

  getById(
    companySlug: string,
    id: string,
    channel?: PublicChannel,
  ): Promise<Vehicle> {
    return fetchLiveVehicle(companySlug, decodeVehicleId(id), channel);
  },

  searchMarketplace(
    filters?: MarketplaceSearchFilters,
  ): Promise<MarketplaceVehicle[]> {
    return searchLiveMarketplace(filters);
  },
};

async function searchLiveMarketplace(
  filters?: MarketplaceSearchFilters,
): Promise<MarketplaceVehicle[]> {
  const location = filters?.location;
  const selectedSlugs = filters?.companySlugs?.length
    ? filters.companySlugs
    : filters?.companySlug
      ? [filters.companySlug]
      : [];
  const listed = selectedSlugs.length
    ? (
        await Promise.all(
          selectedSlugs.map((slug) =>
            companiesApi.getBySlug(slug).catch(() => null),
          ),
        )
      ).flatMap((company) => (company ? [company] : []))
    : await companiesApi.getAll({
        location,
        from: filters?.from,
        to: filters?.to,
      });
  const branchId = filters?.branchId;
  const companies = branchId
    ? listed.filter((company) =>
        company.branches.some((branch) => branch.id === branchId),
      )
    : listed;

  const fleets = await Promise.all(
    companies.map(async (company) => {
      const vehicles = await vehiclesApi.getByCompany(company.slug, {
        from: filters?.from,
        to: filters?.to,
        branchId,
      });
      return vehicles.map((vehicle) => ({ ...vehicle, company }));
    }),
  );

  return fleets.flat();
}
