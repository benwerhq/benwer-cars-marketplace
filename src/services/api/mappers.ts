import { getCityByName, getCityBySlug } from "@/data/malagaCities";
import { slugifyLocation } from "@/lib/locationOptions";
import {
  CaptureMethod,
  FuelType,
  PaymentChannel,
  PaymentStatus,
  ReservationStatus,
  TransmissionType,
  VehicleStatus,
  VehicleType,
} from "@/enums";
import { BookingMode, SiteStatus } from "@/enums";
import { parseSiteLayout } from "@/lib/siteLayout";
import { listingRangeDates } from "@/lib/dates";
import { toPublicMediaSrc } from "@/lib/media";
import type {
  AvailabilityQuery,
  AvailabilityRange,
} from "@/types/availability";
import type { Company, CompanyBranch } from "@/types/company";
import type { InsurancePackageQuote } from "@/types/insurance";
import type {
  PriceBreakdown,
  PriceSegment,
  PriceSource,
  PriceWarning,
} from "@/types/pricing";
import type { GuestCancellationQuote, GuestPayment } from "@/types/payment";
import type { GuestAccount, GuestCustomer } from "@/types/guest";
import type { GuestReservation } from "@/types/reservation";
import type { PublicSite, SiteBranch } from "@/types/site";
import type { WebsiteSettings } from "@/types/websiteSettings";
import type { SiteContent } from "@/types/siteContent";
import { withDemoReviews } from "@/lib/demoReviews";
import { parseSiteContent } from "@/lib/siteContent";
import type { Vehicle, VehicleGroup } from "@/types/vehicle";

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

  // Guest endpoints (e.g. /guest/reservations) answer { items: [...] }.
  if (isRecord(payload) && Array.isArray(payload.items)) {
    return payload.items as T[];
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
      return FuelType.HYBRID;
    case FuelType.PLUGIN_HYBRID:
      return FuelType.PLUGIN_HYBRID;
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

function mapPaymentStatus(status: string | undefined): PaymentStatus {
  if (
    status &&
    Object.values(PaymentStatus).includes(status as PaymentStatus)
  ) {
    return status as PaymentStatus;
  }

  return PaymentStatus.UNPAID;
}

function mapPaymentChannel(value: string | undefined): PaymentChannel | null {
  if (
    value &&
    Object.values(PaymentChannel).includes(value as PaymentChannel)
  ) {
    return value as PaymentChannel;
  }

  return null;
}

function mapCaptureMethod(value: string | undefined): CaptureMethod | null {
  if (
    value &&
    Object.values(CaptureMethod).includes(value as CaptureMethod)
  ) {
    return value as CaptureMethod;
  }

  return null;
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

function mapCompanyBranches(raw: unknown): CompanyBranch[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.flatMap((item: unknown) => {
    const row = isRecord(item) ? item : {};
    const id = readId(row.id);
    const name = readString(row.name);
    return id && name
      ? [{ id, name, address: readString(row.address) ?? "" }]
      : [];
  });
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
    address: readString(row.address) ?? readString(row.registeredAddress) ?? null,
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
    branches: mapCompanyBranches(row.branches),
    allowDifferentReturn: readBoolean(row.allowDifferentReturn) ?? false,
  };
}

export interface VehicleMapOptions {
  companySlug?: string;
  currency?: string;
}

function mapVehicleGroup(raw: unknown): VehicleGroup | null {
  if (!isRecord(raw)) {
    return null;
  }
  const id = readId(raw.id);
  if (!id) {
    return null;
  }
  return {
    id,
    name: readStringRecord(raw.name) ?? {},
    code: readString(raw.code) ?? null,
    sortOrder: readNumber(raw.sortOrder) ?? 0,
  };
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
    photoUrl: readPhotoUrl(row.photoUrl) ?? null,
    categoryImageUrl: readPhotoUrl(row.categoryImageUrl) ?? null,
    description: readString(row.description) ?? null,
    color: readString(row.color) ?? null,
    deposit: readNumber(row.deposit) ?? null,
    category: readString(row.category) ?? null,
    group: mapVehicleGroup(row.group),
    mileage:
      readNumber(row.currentMileage) ??
      readNumber(row.mileage) ??
      readNumber(row.odometer) ??
      null,
    branchId:
      readId(row.branchId) ??
      readId(row.pickupBranchId) ??
      readId(row.locationId) ??
      null,
  };
}

export function mapReservation(
  raw: unknown,
  fallbackSlug?: string,
): GuestReservation {
  const row = isRecord(raw) ? raw : {};
  const customer = isRecord(row.customer) ? row.customer : {};
  const insurance = mapReservationInsurance(row.insurance);
  const grandTotal = readNumber(row.grandTotal);
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
    // The API grand total covers car, insurance, extras, fees and adjustments.
    // Older responses only send totalAmount (the car alone), so add the
    // insurance they return separately.
    totalPrice:
      grandTotal ??
      (readNumber(row.totalPrice) ??
        readNumber(row.totalAmount) ??
        readNumber(row.total) ??
        0) + (insurance?.total ?? 0),
    insurance,
    extrasTotal: grandTotal === undefined ? null : (readNumber(row.extrasTotal) ?? null),
    feesTotal: grandTotal === undefined ? null : (readNumber(row.feesTotal) ?? null),
    pickupTime: readString(row.pickupTime) ?? null,
    returnTime: readString(row.returnTime) ?? null,
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
    requestExpiresAt: readString(row.requestExpiresAt) ?? null,
    cancelReason:
      readString(row.cancelReason) ??
      readString(row.cancellationReason) ??
      null,
    paymentStatus: mapPaymentStatus(readString(row.paymentStatus)),
    paymentChannel: mapPaymentChannel(readString(row.paymentChannel)),
    paidAmount: readNumber(row.paidAmount) ?? 0,
    advanceDue: readNumber(row.advanceDue) ?? 0,
    advanceAuthorized: readBoolean(row.advanceAuthorized) ?? false,
    paymentExpiresAt:
      readString(row.paymentExpiresAt) ??
      readString(row.payLinkExpiresAt) ??
      null,
    onlinePaymentRequired: readBoolean(row.onlinePaymentRequired) ?? false,
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
              year: readNumber(row.vehicleYear),
              dailyRate: readNumber(row.dailyRate),
              currency: readString(row.currency),
            },
            { companySlug, currency: readString(row.currency) },
          )
        : null,
    company: row.company ? mapCompany(row.company) : null,
  };
}

function mapReservationInsurance(
  raw: unknown,
): { name: Record<string, string> | null; code: string; total: number } | null {
  if (!isRecord(raw)) {
    return null;
  }
  const total = readNumber(raw.total) ?? 0;
  return {
    name: readStringRecord(raw.name),
    code: readString(raw.code) ?? "",
    total,
  };
}

export function mapGuestCustomer(raw: unknown): GuestCustomer | null {
  if (!isRecord(raw)) {
    return null;
  }
  const id = readString(raw.id);
  if (!id) {
    return null;
  }
  const dateOfBirth = readString(raw.dateOfBirth)?.slice(0, 10);
  return {
    id,
    fullName: readString(raw.fullName) ?? readString(raw.name) ?? "",
    email: readString(raw.email) ?? "",
    phone: readString(raw.phone) ?? "",
    ...(dateOfBirth ? { dateOfBirth } : {}),
  };
}

export function mapGuestAccount(
  raw: unknown,
  fallbackSlug?: string,
): GuestAccount {
  const row = isRecord(raw) ? raw : {};
  const nested = isRecord(row.data) ? row.data : row;
  const user = isRecord(nested.user) ? nested.user : {};
  const customer = isRecord(nested.customer) ? nested.customer : {};

  return {
    email:
      readString(nested.email) ??
      readString(user.email) ??
      readString(customer.email) ??
      "",
    linked:
      readBoolean(nested.linked) ??
      Boolean(readString(nested.linkedAt) ?? readString(nested.customerId)),
    companySlug:
      readString(nested.companySlug) ??
      (isRecord(nested.company)
        ? readString(nested.company.slug)
        : undefined) ??
      fallbackSlug ??
      "",
    emailVerified: readBoolean(nested.emailVerified) ?? false,
    customer: mapGuestCustomer(nested.customer),
  };
}

export function mapGuestReservationList(
  payload: unknown,
  fallbackSlug?: string,
): GuestReservation[] {
  return unwrapList(payload)
    .map((row) => mapReservation(row, fallbackSlug))
    .filter((reservation) => reservation.id || reservation.token);
}

export function mapGuestPayment(raw: unknown): GuestPayment {
  const row = isRecord(raw) ? raw : {};
  const payment = isRecord(row.payment) ? row.payment : row;

  return {
    reservationId:
      readId(payment.reservationId) ?? readId(row.reservationId) ?? "",
    status: mapPaymentStatus(
      readString(payment.status) ?? readString(payment.paymentStatus),
    ),
    channel: mapPaymentChannel(
      readString(payment.channel) ?? readString(payment.paymentChannel),
    ),
    captureMethod: mapCaptureMethod(readString(payment.captureMethod)),
    required: readBoolean(payment.required) ?? false,
    authorized: readBoolean(payment.authorized) ?? false,
    amount:
      readNumber(payment.amount) ??
      readNumber(payment.advanceDue) ??
      readNumber(payment.due) ??
      0,
    paidAmount: readNumber(payment.paidAmount) ?? 0,
    currency: readString(payment.currency) || "EUR",
    checkoutUrl:
      readString(payment.checkoutUrl) ??
      readString(payment.payLinkUrl) ??
      null,
    clientSecret: readString(payment.clientSecret) ?? null,
    publishableKey: readString(payment.publishableKey) ?? null,
    connectedAccountId: readString(payment.connectedAccountId) ?? null,
    expiresAt:
      readString(payment.expiresAt) ??
      readString(payment.payLinkExpiresAt) ??
      null,
  };
}

export function mapCancellationQuote(raw: unknown): GuestCancellationQuote {
  const row = isRecord(raw) ? raw : {};

  return {
    canOverride: false,
    canCancel: readBoolean(row.canCancel) ?? true,
    fee:
      readNumber(row.fee) ??
      readNumber(row.cancellationFee) ??
      readNumber(row.cancellation_fee) ??
      0,
    refund:
      readNumber(row.refund) ??
      readNumber(row.refundAmount) ??
      readNumber(row.cancellationRefund) ??
      0,
    chargeAmount:
      readNumber(row.chargeAmount) ??
      readNumber(row.total) ??
      readNumber(row.fee) ??
      readNumber(row.cancellationFee) ??
      0,
    currency: readString(row.currency) || "EUR",
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
    available: readBoolean(row.available),
    from: range?.from,
    to: range?.to,
  };
}

function mapSiteStatus(value: string | undefined): SiteStatus {
  switch (value) {
    case SiteStatus.PAUSED:
      return SiteStatus.PAUSED;
    case SiteStatus.DRAFT:
      return SiteStatus.DRAFT;
    default:
      return SiteStatus.PUBLISHED;
  }
}

function mapBookingMode(value: string | undefined): BookingMode {
  return value === BookingMode.REQUEST
    ? BookingMode.REQUEST
    : BookingMode.INSTANT;
}

function mapLocalizedCopy(value: unknown): Record<string, string> {
  if (typeof value === "string" && value.trim()) {
    return { "en-GB": value };
  }

  if (!isRecord(value)) {
    return {};
  }

  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && entry[1].trim().length > 0,
  );
  return Object.fromEntries(entries);
}

function mapSiteBranch(raw: unknown): SiteBranch | null {
  if (!isRecord(raw)) {
    return null;
  }

  const id = readId(raw.id) ?? readString(raw.slug);
  const name = readString(raw.name) ?? readString(raw.label);
  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    address: readString(raw.address) ?? null,
  };
}

export function mapPublicSite(raw: unknown, fallbackSlug?: string): PublicSite {
  const row = isRecord(raw) ? raw : {};
  const nestedSite = isRecord(row.site) ? row.site : row;
  const nestedCompany = isRecord(row.company)
    ? row.company
    : isRecord(nestedSite.company)
      ? nestedSite.company
      : row;
  const company = mapCompany({
    ...nestedCompany,
    slug:
      readString(nestedCompany.slug) ??
      readString(nestedSite.slug) ??
      fallbackSlug,
  });
  const slug =
    readString(nestedSite.slug) ??
    readString(row.slug) ??
    company.slug ??
    fallbackSlug ??
    "";
  const branchesRaw =
    nestedSite.branches ??
    nestedSite.locations ??
    row.branches ??
    row.locations;
  const branches = Array.isArray(branchesRaw)
    ? branchesRaw
        .map(mapSiteBranch)
        .filter((branch): branch is SiteBranch => branch !== null)
    : [];

  return {
    slug,
    status: mapSiteStatus(
      readString(nestedSite.status) ?? readString(nestedSite.publicationStatus),
    ),
    bookingMode: mapBookingMode(
      readString(nestedSite.bookingMode) ?? readString(row.bookingMode),
    ),
    minLeadHours:
      readNumber(nestedSite.minLeadHours) ??
      readNumber(row.minLeadHours) ??
      0,
    requestWindowHours:
      readNumber(nestedSite.requestWindowHours) ??
      readNumber(row.requestWindowHours) ??
      0,
    headline: mapLocalizedCopy(
      nestedSite.headline ?? nestedSite.headlines ?? row.headline,
    ),
    intro: mapLocalizedCopy(
      nestedSite.intro ?? nestedSite.introduction ?? row.intro,
    ),
    showPhone:
      readBoolean(nestedSite.showPhone) ??
      readBoolean(row.showPhone) ??
      Boolean(company.phone),
    showEmail:
      readBoolean(nestedSite.showEmail) ??
      readBoolean(row.showEmail) ??
      Boolean(company.email),
    showAddress:
      readBoolean(nestedSite.showAddress) ??
      readBoolean(row.showAddress) ??
      Boolean(company.address),
    isPreview:
      readBoolean(nestedSite.preview) ??
      readBoolean(row.preview) ??
      readBoolean(row.isPreview) ??
      false,
    layout: parseSiteLayout(
      readString(nestedSite.layout) ??
        readString(nestedSite.template) ??
        readString(row.layout),
    ),
    canonicalUrl:
      readString(nestedSite.canonicalUrl) ??
      readString(row.canonicalUrl) ??
      null,
    company: {
      ...company,
      slug: company.slug || slug,
    },
    branches,
    allowDifferentReturn:
      readBoolean(nestedSite.allowDifferentReturn) ?? readBoolean(row.allowDifferentReturn) ?? false,
    oneWayRentals:
      readBoolean(nestedSite.oneWayRentals) ?? readBoolean(row.oneWayRentals) ?? false,
    content: withSiteDemoReviews(
      company.id,
      parseSiteContent(nestedSite.appearance ?? row.appearance, nestedSite.reviews ?? row.reviews),
    ),
  };
}

function withSiteDemoReviews(companyId: string, content: SiteContent): SiteContent {
  return { ...content, reviews: withDemoReviews(companyId, content.reviews) };
}

export function mapWebsiteSettings(raw: unknown): WebsiteSettings {
  const row = isRecord(raw) ? raw : {};
  const nested = isRecord(row.data) ? row.data : isRecord(row.website) ? row.website : row;
  const role = (readString(nested.role) ?? readString(row.role) ?? "").toLowerCase();
  const namedRole = ["owner", "admin", "manager"].includes(role);
  const canEdit = readBoolean(nested.canEdit) ?? (role ? namedRole : true);
  const draft = nested.appearance;
  const published = nested.publishedAppearance;

  return {
    status: mapSiteStatus(readString(nested.status)),
    bookingMode: mapBookingMode(readString(nested.bookingMode)),
    minLeadHours: readNumber(nested.minLeadHours) ?? 0,
    requestWindowHours: readNumber(nested.requestWindowHours) ?? 24,
    headline: mapLocalizedCopy(nested.headline),
    intro: mapLocalizedCopy(nested.intro),
    showPhone: readBoolean(nested.showPhone) ?? false,
    showEmail: readBoolean(nested.showEmail) ?? false,
    showAddress: readBoolean(nested.showAddress) ?? false,
    revision: readNumber(nested.revision) ?? 0,
    hasUnpublishedChanges:
      published !== undefined && JSON.stringify(draft) !== JSON.stringify(published),
    canPublish: readBoolean(nested.canPublish) ?? true,
    content: parseSiteContent(draft, nested.reviews),
    canEdit: Boolean(canEdit),
  };
}

export function mapInsurancePackageList(
  payload: unknown,
): InsurancePackageQuote[] {
  const rows = isRecord(payload) && Array.isArray(payload.data)
    ? payload.data
    : unwrapList(payload);

  return rows.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const packageId = readId(item.packageId) ?? readId(item.id);
    if (!packageId) {
      return [];
    }

    return [
      {
        packageId,
        code: readString(item.code) ?? "",
        name: mapLocalizedCopy(item.name),
        description: (() => {
          const copy = mapLocalizedCopy(item.description);
          return Object.keys(copy).length > 0 ? copy : null;
        })(),
        pricePerDay: readNumber(item.pricePerDay) ?? 0,
        total: readNumber(item.total) ?? 0,
        excessAmount: readNumber(item.excessAmount) ?? 0,
        depositAmount: readNumber(item.depositAmount) ?? 0,
        isDefault: readBoolean(item.isDefault) ?? false,
      },
    ];
  });
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
