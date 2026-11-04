import { getCityByName, getCityBySlug } from "@/data/malagaCities";
import { slugifyLocation } from "@/lib/locationOptions";
import {
  FuelType,
  ReservationStatus,
  TransmissionType,
  VehicleStatus,
  VehicleType,
} from "@/enums";
import { listingRangeDates } from "@/lib/dates";
import { toPublicMediaSrc } from "@/lib/media";
import type {
  AvailabilityQuery,
  AvailabilityRange,
} from "@/types/availability";
import type { Company } from "@/types/company";
import type {
  PriceBreakdown,
  PriceSegment,
  PriceSource,
  PriceWarning,
} from "@/types/pricing";
import type { GuestReservation } from "@/types/reservation";
import type { Vehicle } from "@/types/vehicle";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readId(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return readString(value);
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );
}

export function unwrapList<T>(payload: unknown): T[] {
  if (payload == null) {
    return [];
  }

  if (isRecord(payload) && Array.isArray(payload.data)) {
    return payload.data as T[];
  }

  if (Array.isArray(payload)) {
    return payload as T[];
  }

  return [];
}

function mapVehicleType(value: string | undefined): VehicleType {
  switch (value) {
    case VehicleType.SUV:
    case "suv":
      return VehicleType.SUV;
    case VehicleType.VAN:
    case "van":
    case "minivan":
      return VehicleType.VAN;
    case VehicleType.TRUCK:
    case "truck":
      return VehicleType.TRUCK;
    case VehicleType.MOTORCYCLE:
    case "motorcycle":
      return VehicleType.MOTORCYCLE;
    case VehicleType.CAR:
    case "car":
    case "economy":
    case "sedan":
    case "other":
    default:
      return VehicleType.CAR;
  }
}

function mapFuel(value: string | undefined): FuelType {
  switch (value) {
    case FuelType.DIESEL:
    case "diesel":
      return FuelType.DIESEL;
    case FuelType.ELECTRIC:
    case "electric":
      return FuelType.ELECTRIC;
    case FuelType.HYBRID:
    case "hybrid":
    case "plugin_hybrid":
      return FuelType.HYBRID;
    default:
      return FuelType.PETROL;
  }
}

function mapTransmission(value: string | undefined): TransmissionType {
  return value === TransmissionType.MANUAL || value === "manual"
    ? TransmissionType.MANUAL
    : TransmissionType.AUTOMATIC;
}

function mapVehicleStatus(
  status: string | undefined,
  available: boolean | undefined,
): VehicleStatus {
  if (
    status &&
    Object.values(VehicleStatus).includes(status as VehicleStatus)
  ) {
    return status as VehicleStatus;
  }

  return available === false ? VehicleStatus.RESERVED : VehicleStatus.AVAILABLE;
}

function mapReservationStatus(status: string | undefined): ReservationStatus {
  if (
    status &&
    Object.values(ReservationStatus).includes(status as ReservationStatus)
  ) {
    return status as ReservationStatus;
  }

  return ReservationStatus.CONFIRMED;
}

function inferLocationSlug(
  locationSlug: string | undefined,
  location: string | undefined,
): string | null {
  if (locationSlug && getCityBySlug(locationSlug)) {
    return locationSlug;
  }

  const fromName =
    getCityByName(locationSlug)?.slug ?? getCityByName(location)?.slug;
  if (fromName) {
    return fromName;
  }

  const raw = locationSlug ?? location;
  if (!raw) {
    return null;
  }

  return slugifyLocation(raw) || null;
}

function toPublicPhotoSrc(value: string): string | undefined {
  return toPublicMediaSrc(value);
}

function readPhotoUrl(value: unknown): string | undefined {
  const raw =
    typeof value === "string" && value.trim()
      ? value.trim()
      : isRecord(value)
        ? (readString(value.url) ??
          readString(value.src) ??
          readString(value.href) ??
          readString(value.photoUrl) ??
          readString(value.publicUrl) ??
          readString(value.signedUrl) ??
          readString(value.key) ??
          readString(value.path))
        : undefined;

  return raw ? toPublicPhotoSrc(raw) : undefined;
}

const PHOTO_COLLECTION_KEYS = [
  "photos",
  "images",
  "media",
  "gallery",
  "files",
] as const;

const PHOTO_SINGLE_KEYS = [
  "photoUrl",
  "imageUrl",
  "coverImage",
  "thumbnailUrl",
  "primaryPhoto",
  "image",
  "photo",
] as const;

function readAttachmentPhotos(row: Record<string, unknown>): string[] {
  const attachments = row.attachments;
  if (!Array.isArray(attachments)) {
    return [];
  }

  const vehiclePhotos: string[] = [];
  const stockPhotos: string[] = [];
  const otherPhotos: string[] = [];

  for (const item of attachments) {
    const url = readPhotoUrl(item);
    if (!url) {
      continue;
    }

    const kind = isRecord(item)
      ? (readString(item.kind) ?? readString(item.type) ?? "").toLowerCase()
      : "";

    if (kind === "vehicle_photo" || kind === "photo") {
      vehiclePhotos.push(url);
    } else if (kind === "stock_photo") {
      stockPhotos.push(url);
    } else {
      otherPhotos.push(url);
    }
  }

  return [...vehiclePhotos, ...stockPhotos, ...otherPhotos];
}

function readPhotos(row: Record<string, unknown>): string[] {
  const collected: string[] = [...readAttachmentPhotos(row)];

  for (const key of PHOTO_COLLECTION_KEYS) {
    const value = row[key];
    if (!Array.isArray(value)) {
      continue;
    }

    for (const item of value) {
      const url = readPhotoUrl(item);
      if (url) {
        collected.push(url);
      }
    }
  }

  for (const key of PHOTO_SINGLE_KEYS) {
    const url = readPhotoUrl(row[key]);
    if (url) {
      collected.push(url);
    }
  }

  return [...new Set(collected)];
}

export function mapCompany(raw: unknown): Company {
  const row = isRecord(raw) ? raw : {};
  const branding = isRecord(row.branding) ? row.branding : {};
  const location = readString(row.location) ?? readString(row.city) ?? null;
  const locationSlug = inferLocationSlug(
    readString(row.locationSlug) ?? readString(row.citySlug),
    location ?? undefined,
  );

  return {
    id: readId(row.id) ?? readString(row.slug) ?? "",
    slug: readString(row.slug) ?? "",
    name: readString(row.name) ?? readString(row.slug) ?? "",
    description: readString(row.description) ?? null,
    location,
    locationSlug,
    latitude: readNumber(row.latitude) ?? readNumber(row.lat) ?? null,
    longitude: readNumber(row.longitude) ?? readNumber(row.lng) ?? null,
    vehicleCount:
      readNumber(row.vehicleCount) ?? readNumber(row.fleetSize) ?? null,
    isPublic: readBoolean(row.isPublic) ?? true,
    websiteUrl:
      readString(row.websiteUrl) ??
      readString(row.website) ??
      readString(row.url) ??
      null,
    email: readString(row.email) ?? readString(row.contactEmail) ?? null,
    phone:
      readString(row.phone) ??
      readString(row.phoneNumber) ??
      readString(row.contactPhone) ??
      null,
    branding: {
      primaryColor: readString(branding.primaryColor) ?? "",
      logoUrl:
        readPhotoUrl(branding.logoUrl) ??
        readPhotoUrl(branding.logoURL) ??
        readPhotoUrl(branding.logo) ??
        readPhotoUrl(row.logoUrl) ??
        readPhotoUrl(row.logo) ??
        null,
    },
  };
}

export interface VehicleMapOptions {
  companySlug?: string;
  currency?: string;
}

export function mapVehicle(
  raw: unknown,
  options?: VehicleMapOptions | string,
): Vehicle {
  const fallbackSlug =
    typeof options === "string" ? options : options?.companySlug;
  const fallbackCurrency =
    typeof options === "string" ? undefined : options?.currency;
  const row = isRecord(raw) ? raw : {};

  return {
    id: readId(row.id) ?? readId(row.vehicleId) ?? readId(row.uuid) ?? "",
    companySlug: readString(row.companySlug) ?? fallbackSlug ?? "",
    brand: readString(row.brand) ?? readString(row.make) ?? "",
    model: readString(row.model) ?? "",
    year: readNumber(row.year) ?? 0,
    type: mapVehicleType(readString(row.type) ?? readString(row.category)),
    transmission: mapTransmission(readString(row.transmission)),
    fuel: mapFuel(readString(row.fuel) ?? readString(row.fuelType)),
    seats: readNumber(row.seats) ?? 5,
    pricePerDay: readNumber(row.pricePerDay) ?? readNumber(row.dailyRate) ?? 0,
    currency: readString(row.currency) || fallbackCurrency || "EUR",
    status: mapVehicleStatus(
      readString(row.status),
      readBoolean(row.available),
    ),
    isPublic: readBoolean(row.isPublic) ?? true,
    photos: readPhotos(row),
    description: readString(row.description) ?? null,
    color: readString(row.color) ?? null,
    deposit: readNumber(row.deposit) ?? null,
    category: readString(row.category) ?? null,
    mileage:
      readNumber(row.currentMileage) ??
      readNumber(row.mileage) ??
      readNumber(row.odometer) ??
      null,
  };
}

export function mapReservation(
  raw: unknown,
  fallbackSlug?: string,
): GuestReservation {
  const row = isRecord(raw) ? raw : {};
  const customer = isRecord(row.customer) ? row.customer : {};
  const companySlug =
    readString(row.companySlug) ??
    (isRecord(row.company) ? readString(row.company.slug) : undefined) ??
    fallbackSlug ??
    "";

  return {
    id: readString(row.id) ?? readString(row.token) ?? "",
    token: readString(row.token) ?? readString(row.id) ?? "",
    status: mapReservationStatus(readString(row.status)),
    vehicleId: readString(row.vehicleId) ?? readString(row.vehicleID) ?? "",
    startDate: readString(row.startDate) ?? "",
    endDate: readString(row.endDate) ?? "",
    totalPrice:
      readNumber(row.totalPrice) ??
      readNumber(row.grandTotal) ??
      readNumber(row.totalAmount) ??
      readNumber(row.total) ??
      0,
    priceBreakdown: mapPriceBreakdown(row.priceBreakdown),
    currency: readString(row.currency) || "EUR",
    guestName: readString(row.guestName) ?? readString(customer.name) ?? "",
    guestEmail: readString(row.guestEmail) ?? readString(customer.email) ?? "",
    guestPhone:
      readString(row.guestPhone) ??
      readString(customer.phone) ??
      readString(customer.phoneNumber) ??
      "",
    companySlug,
    createdAt: readString(row.createdAt) ?? new Date().toISOString(),
    vehicle: row.vehicle
      ? mapVehicle(row.vehicle, {
          companySlug,
          currency: readString(row.currency),
        })
      : readString(row.vehicleMake) || readString(row.vehicleModel)
        ? mapVehicle(
            {
              id: readString(row.vehicleId) ?? readString(row.vehicleID),
              make: readString(row.vehicleMake),
              model: readString(row.vehicleModel),
              dailyRate: readNumber(row.dailyRate),
              currency: readString(row.currency),
            },
            { companySlug, currency: readString(row.currency) },
          )
        : null,
    company: row.company ? mapCompany(row.company) : null,
  };
}

function datesFromConflicts(conflicts: unknown): string[] {
  if (!Array.isArray(conflicts)) {
    return [];
  }

  const dates = new Set<string>();

  for (const item of conflicts) {
    if (!isRecord(item)) {
      continue;
    }

    const from = readString(item.startDate);
    const to = readString(item.endDate);
    if (!from || !to) {
      continue;
    }

    for (const date of listingRangeDates(from, to)) {
      dates.add(date);
    }
  }

  return [...dates];
}

export function mapAvailability(
  raw: unknown,
  range?: Pick<AvailabilityQuery, "from" | "to">,
): AvailabilityRange {
  const row = isRecord(raw) ? raw : {};
  const explicit = readStringArray(row.unavailableDates) ?? [];
  const fromConflicts = datesFromConflicts(row.conflicts);
  const unavailable = [...new Set([...explicit, ...fromConflicts])];

  if (
    unavailable.length === 0 &&
    readBoolean(row.available) === false &&
    range?.from &&
    range.to
  ) {
    unavailable.push(...listingRangeDates(range.from, range.to));
  }

  return {
    vehicleId: readString(row.vehicleId) ?? "",
    unavailableDates: unavailable,
  };
}

export function mapCompanyList(payload: unknown): Company[] {
  return unwrapList(payload)
    .map(mapCompany)
    .filter((company) => company.slug && company.isPublic);
}

export function mapVehicleList(
  payload: unknown,
  options?: VehicleMapOptions | string,
): Vehicle[] {
  return unwrapList(payload)
    .map((row) => mapVehicle(row, options))
    .filter((vehicle) => vehicle.id && vehicle.isPublic);
}

export function mapAvailabilityList(
  payload: unknown,
  range?: Pick<AvailabilityQuery, "from" | "to">,
): AvailabilityRange[] {
  if (
    isRecord(payload) &&
    !Array.isArray(payload) &&
    !Array.isArray(payload.data)
  ) {
    const row = mapAvailability(payload, range);
    return row.vehicleId ? [row] : [];
  }

  return unwrapList(payload)
    .map((row) => mapAvailability(row, range))
    .filter((row) => row.vehicleId);
}

const PRICE_SOURCES: readonly PriceSource[] = ["group", "override", "vehicle"];

function readStringRecord(value: unknown): Record<string, string> | null {
  if (!isRecord(value)) {
    return null;
  }

  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

function mapPriceSegment(raw: unknown): PriceSegment | null {
  if (!isRecord(raw)) {
    return null;
  }

  const startDate = readString(raw.startDate);
  const endDate = readString(raw.endDate);
  const days = readNumber(raw.days);
  const dailyRate = readNumber(raw.dailyRate);
  const subtotal = readNumber(raw.subtotal);
  if (
    !startDate ||
    !endDate ||
    days === undefined ||
    dailyRate === undefined ||
    subtotal === undefined
  ) {
    return null;
  }

  return {
    startDate,
    endDate,
    days,
    seasonId: readString(raw.seasonId) ?? null,
    seasonName: readStringRecord(raw.seasonName),
    dailyRate,
    weekend: readBoolean(raw.weekend) ?? false,
    subtotal,
  };
}

function mapPriceWarning(raw: unknown): PriceWarning | null {
  if (!isRecord(raw)) {
    return null;
  }

  const code = readString(raw.code);
  const seasonId = readString(raw.seasonId);
  const limit = readNumber(raw.limit);
  if (
    (code !== "pricing.min_days" && code !== "pricing.max_days") ||
    !seasonId ||
    limit === undefined
  ) {
    return null;
  }

  return { code, seasonId, limit };
}

export function mapPriceBreakdown(raw: unknown): PriceBreakdown | null {
  if (!isRecord(raw)) {
    return null;
  }

  const totalDays = readNumber(raw.totalDays);
  const vehicleSubtotal = readNumber(raw.vehicleSubtotal);
  const averageDailyRate = readNumber(raw.averageDailyRate);
  const source = PRICE_SOURCES.find((value) => value === raw.source);
  if (
    totalDays === undefined ||
    vehicleSubtotal === undefined ||
    averageDailyRate === undefined ||
    !source
  ) {
    return null;
  }

  return {
    source,
    totalDays,
    segments: (Array.isArray(raw.segments) ? raw.segments : [])
      .map(mapPriceSegment)
      .filter((segment): segment is PriceSegment => segment !== null),
    vehicleSubtotal,
    averageDailyRate,
    warnings: (Array.isArray(raw.warnings) ? raw.warnings : [])
      .map(mapPriceWarning)
      .filter((warning): warning is PriceWarning => warning !== null),
  };
}
