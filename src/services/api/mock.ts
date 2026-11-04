import { isProvinceWideLocation } from "@/data/malagaCities";
import { env } from "@/env";
import { ReservationStatus } from "@/enums";
import { ApiError } from "@/lib/errors";
import { assertMockCatalogueAllowed } from "@/lib/publicApiProxy";
import {
  availabilityCalendarWindow,
  ensureVisibleUnavailableDates,
} from "@/lib/availability";
import {
  countRentalDays,
  dateRangesOverlap,
  listingRangeDates,
} from "@/lib/dates";
import type {
  AvailabilityQuery,
  AvailabilityRange,
} from "@/types/availability";
import type { Company, CompanyListFilters } from "@/types/company";
import type {
  CreateGuestReservationPayload,
  GuestReservation,
} from "@/types/reservation";
import type {
  MarketplaceSearchFilters,
  MarketplaceVehicle,
  Vehicle,
  VehicleFilters,
} from "@/types/vehicle";
import { mockClient } from "./client";
import {
  isListedVehicle,
  matchesVehicleFilters,
  sortVehicles,
} from "./filters";
import {
  mapAvailabilityList,
  mapCompanyList,
  mapReservation,
  mapVehicle,
  mapVehicleList,
  unwrapList,
} from "./mappers";

const MOCK_COMPANIES = "/mock-data/companies.json";
const MOCK_VEHICLES = "/mock-data/vehicles.json";
const MOCK_AVAILABILITY = "/mock-data/availability.json";
const MOCK_RESERVATIONS = "/mock-data/reservations.json";

const createdReservations = new Map<string, GuestReservation>();
let seedReservationsPromise: Promise<GuestReservation[]> | null = null;

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function isVehicleFree(
  vehicleId: string,
  from: string,
  to: string,
  availability: AvailabilityRange[],
  reservations: GuestReservation[],
): boolean {
  const bookedDates = new Set(
    availability.find((row) => row.vehicleId === vehicleId)?.unavailableDates ??
      [],
  );
  const requested = listingRangeDates(from, to);
  if (requested.some((date) => bookedDates.has(date))) {
    return false;
  }

  return !reservations.some(
    (reservation) =>
      reservation.vehicleId === vehicleId &&
      (reservation.status === ReservationStatus.CONFIRMED ||
        reservation.status === ReservationStatus.ACTIVE) &&
      dateRangesOverlap(reservation.startDate, reservation.endDate, from, to),
  );
}

function ensureMockCatalogueAllowed(): void {
  assertMockCatalogueAllowed(env.NEXT_PUBLIC_ENV, process.env.NODE_ENV);
}

async function loadCompanies(): Promise<Company[]> {
  ensureMockCatalogueAllowed();
  return mockClient.get<unknown>(MOCK_COMPANIES).then(mapCompanyList);
}

async function loadVehicles(): Promise<Vehicle[]> {
  ensureMockCatalogueAllowed();
  return mockClient
    .get<unknown>(MOCK_VEHICLES)
    .then((payload) => mapVehicleList(payload));
}

async function loadAvailability(): Promise<AvailabilityRange[]> {
  ensureMockCatalogueAllowed();
  const rows = await mockClient
    .get<unknown>(MOCK_AVAILABILITY)
    .then(mapAvailabilityList);
  const window = availabilityCalendarWindow();

  return rows.map((row) => ({
    ...row,
    unavailableDates: ensureVisibleUnavailableDates(
      row.unavailableDates,
      window.from,
      window.to,
    ),
  }));
}

async function loadSeedReservations(): Promise<GuestReservation[]> {
  ensureMockCatalogueAllowed();
  if (!seedReservationsPromise) {
    seedReservationsPromise = mockClient
      .get<unknown>(MOCK_RESERVATIONS)
      .then((payload) => unwrapList(payload).map((row) => mapReservation(row)))
      .catch(() => []);
  }

  return seedReservationsPromise;
}

async function allReservations(): Promise<GuestReservation[]> {
  const seeded = await loadSeedReservations();
  const created = [...createdReservations.values()];
  const byToken = new Map<string, GuestReservation>();

  for (const reservation of [...seeded, ...created]) {
    byToken.set(reservation.token, reservation);
  }

  return [...byToken.values()];
}

export const mockCompaniesApi = {
  async getAll(filters?: CompanyListFilters): Promise<Company[]> {
    const [companies, vehicles, availability, reservations] = await Promise.all(
      [loadCompanies(), loadVehicles(), loadAvailability(), allReservations()],
    );

    return companies
      .filter((company) => {
        if (
          filters?.location &&
          !isProvinceWideLocation(filters.location) &&
          company.locationSlug !== filters.location
        ) {
          return false;
        }

        if (filters?.q) {
          const query = normalize(filters.q);
          const haystack = normalize(
            `${company.name} ${company.location ?? ""} ${company.description ?? ""}`,
          );
          if (!haystack.includes(query)) {
            return false;
          }
        }

        if (filters?.from && filters?.to) {
          const hasOpenVehicle = vehicles.some(
            (vehicle) =>
              vehicle.companySlug === company.slug &&
              isListedVehicle(vehicle) &&
              isVehicleFree(
                vehicle.id,
                filters.from ?? "",
                filters.to ?? "",
                availability,
                reservations,
              ),
          );
          if (!hasOpenVehicle) {
            return false;
          }
        }

        return true;
      })
      .map((company) => ({
        ...company,
        vehicleCount: vehicles.filter((vehicle) => {
          if (
            vehicle.companySlug !== company.slug ||
            !isListedVehicle(vehicle)
          ) {
            return false;
          }

          if (
            filters?.from &&
            filters?.to &&
            !isVehicleFree(
              vehicle.id,
              filters.from,
              filters.to,
              availability,
              reservations,
            )
          ) {
            return false;
          }

          return true;
        }).length,
      }));
  },

  async getBySlug(slug: string): Promise<Company> {
    const companies = await loadCompanies();
    const found = companies.find((company) => company.slug === slug);
    if (!found) {
      throw new ApiError(404, "company.not_found");
    }

    return found;
  },
};

export const mockVehiclesApi = {
  async getByCompany(
    companySlug: string,
    filters?: VehicleFilters,
  ): Promise<Vehicle[]> {
    const [vehicles, availability, reservations] = await Promise.all([
      loadVehicles(),
      loadAvailability(),
      allReservations(),
    ]);

    const filtered = vehicles.filter((vehicle) => {
      if (vehicle.companySlug !== companySlug || !isListedVehicle(vehicle)) {
        return false;
      }

      if (!matchesVehicleFilters(vehicle, filters)) {
        return false;
      }

      if (
        filters?.from &&
        filters?.to &&
        !isVehicleFree(
          vehicle.id,
          filters.from,
          filters.to,
          availability,
          reservations,
        )
      ) {
        return false;
      }

      return true;
    });

    return sortVehicles(filtered, filters?.sort);
  },

  async getById(companySlug: string, id: string): Promise<Vehicle> {
    const vehicles = await loadVehicles();
    const found = vehicles.find(
      (vehicle) => vehicle.id === id && vehicle.companySlug === companySlug,
    );
    if (!found || !found.isPublic) {
      throw new ApiError(404, "vehicle.not_found");
    }

    return mapVehicle(found, companySlug);
  },

  async searchMarketplace(
    filters?: MarketplaceSearchFilters,
  ): Promise<MarketplaceVehicle[]> {
    const [companies, vehicles, availability, reservations] = await Promise.all(
      [loadCompanies(), loadVehicles(), loadAvailability(), allReservations()],
    );
    const location =
      filters?.location && !isProvinceWideLocation(filters.location)
        ? filters.location
        : undefined;
    const companiesBySlug = new Map(
      companies.map((company) => [company.slug, company]),
    );

    const filtered = vehicles.filter((vehicle) => {
      if (!isListedVehicle(vehicle)) {
        return false;
      }

      const company = companiesBySlug.get(vehicle.companySlug);
      if (!company) {
        return false;
      }

      const selectedSlugs = filters?.companySlugs?.length
        ? filters.companySlugs
        : filters?.companySlug
          ? [filters.companySlug]
          : [];
      if (selectedSlugs.length && !selectedSlugs.includes(company.slug)) {
        return false;
      }

      if (location && company.locationSlug !== location) {
        return false;
      }

      if (!matchesVehicleFilters(vehicle, filters)) {
        return false;
      }

      if (
        filters?.from &&
        filters?.to &&
        !isVehicleFree(
          vehicle.id,
          filters.from,
          filters.to,
          availability,
          reservations,
        )
      ) {
        return false;
      }

      return true;
    });

    return sortVehicles(filtered, filters?.sort).flatMap((vehicle) => {
      const company = companiesBySlug.get(vehicle.companySlug);
      return company ? [{ ...vehicle, company }] : [];
    });
  },
};

export const mockAvailabilityApi = {
  async check(
    companySlug: string,
    params: AvailabilityQuery,
  ): Promise<AvailabilityRange[]> {
    const [vehicles, availability] = await Promise.all([
      loadVehicles(),
      loadAvailability(),
    ]);

    const companyVehicleIds = new Set(
      vehicles
        .filter(
          (vehicle) =>
            vehicle.companySlug === companySlug && isListedVehicle(vehicle),
        )
        .map((vehicle) => vehicle.id),
    );

    return availability.filter((row) => {
      if (!companyVehicleIds.has(row.vehicleId)) {
        return false;
      }

      if (params.vehicleId && row.vehicleId !== params.vehicleId) {
        return false;
      }

      return true;
    });
  },
};

export const mockReservationsApi = {
  async create(
    companySlug: string,
    payload: CreateGuestReservationPayload,
  ): Promise<GuestReservation> {
    const [vehicle, availability, reservations] = await Promise.all([
      mockVehiclesApi.getById(companySlug, payload.vehicleId),
      loadAvailability(),
      allReservations(),
    ]);

    const days = countRentalDays(payload.startDate, payload.endDate);
    if (days <= 0) {
      throw new ApiError(400, "unknown", [
        { field: "endDate", code: "reservation.invalid_dates" },
      ]);
    }

    if (
      !isVehicleFree(
        payload.vehicleId,
        payload.startDate,
        payload.endDate,
        availability,
        reservations,
      )
    ) {
      throw new ApiError(409, "reservation.overlap");
    }

    const token =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `mock-${Date.now()}`;

    let company = null;
    try {
      company = await mockCompaniesApi.getBySlug(companySlug);
    } catch {
      company = null;
    }

    const reservation: GuestReservation = {
      id: token,
      token,
      status: ReservationStatus.CONFIRMED,
      vehicleId: vehicle.id,
      startDate: payload.startDate,
      endDate: payload.endDate,
      totalPrice: days * vehicle.pricePerDay,
      priceBreakdown: null,
      currency: vehicle.currency,
      guestName: payload.guestName,
      guestEmail: payload.guestEmail,
      guestPhone: payload.guestPhone,
      companySlug,
      createdAt: new Date().toISOString(),
      vehicle,
      company,
    };

    createdReservations.set(token, reservation);
    return reservation;
  },

  async getByToken(token: string): Promise<GuestReservation> {
    const created = createdReservations.get(token);
    if (created) {
      return hydrateReservation(created);
    }

    const seeded = await loadSeedReservations();
    const found = seeded.find((reservation) => reservation.token === token);
    if (!found) {
      throw new ApiError(404, "reservation.not_found");
    }

    return hydrateReservation(found);
  },
};

async function hydrateReservation(
  reservation: GuestReservation,
): Promise<GuestReservation> {
  const [vehicle, company] = await Promise.all([
    reservation.vehicle
      ? Promise.resolve(reservation.vehicle)
      : mockVehiclesApi
          .getById(reservation.companySlug, reservation.vehicleId)
          .catch(() => null),
    reservation.company
      ? Promise.resolve(reservation.company)
      : mockCompaniesApi.getBySlug(reservation.companySlug).catch(() => null),
  ]);

  return { ...reservation, vehicle, company };
}
