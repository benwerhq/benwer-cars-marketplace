export enum VehicleStatus {
  AVAILABLE = "available",
  RESERVED = "reserved",
  RENTED = "rented",
  MAINTENANCE = "maintenance",
}

export enum ReservationStatus {
  DRAFT = "draft",
  CONFIRMED = "confirmed",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum SiteStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  PAUSED = "paused",
}

export enum BookingMode {
  INSTANT = "instant",
  REQUEST = "request",
}

export enum PublicChannel {
  MARKETPLACE = "marketplace",
  WEBSITE = "website",
}

export enum PaymentStatus {
  UNPAID = "unpaid",
  PARTIALLY_PAID = "partially_paid",
  PAID = "paid",
  REFUND_DUE = "refund_due",
}

export enum PaymentChannel {
  WALK_IN = "walk_in",
  PHONE = "phone",
  CASH = "cash",
  WEBSITE = "website",
}

export enum CaptureMethod {
  MANUAL = "manual",
  AUTOMATIC = "automatic",
}

export enum VehicleType {
  CAR = "car",
  SUV = "suv",
  VAN = "van",
  TRUCK = "truck",
  MOTORCYCLE = "motorcycle",
}

export enum TransmissionType {
  AUTOMATIC = "automatic",
  MANUAL = "manual",
}

export enum FuelType {
  PETROL = "petrol",
  DIESEL = "diesel",
  ELECTRIC = "electric",
  HYBRID = "hybrid",
}

export enum QueryKeys {
  COMPANIES = "companies",
  COMPANY = "company",
  VEHICLES = "vehicles",
  VEHICLE = "vehicle",
  AVAILABILITY = "availability",
  RESERVATION = "reservation",
  PRICE_QUOTE = "price-quote",
  SITE = "site",
  INSURANCE = "insurance",
  PAYMENT = "payment",
  CANCELLATION_QUOTE = "cancellation-quote",
}

export enum StorageKeys {
  LOCALE = "NEXT_LOCALE",
  COOKIE_CONSENT = "benwer-cookie-consent",
}

export enum NavRoutes {
  HOME = "/",
  CARS = "/cars",
  COMPANIES = "/companies",
  COMPANY = "/companies/:slug",
  CAR_DETAIL = "/cars/:id",
  BOOK = "/book",
  BOOKING_STATUS = "/booking/:token",
  PRIVACY = "/privacy",
  TERMS = "/terms",
  COOKIES = "/cookies",
  CONTACT = "/contact",
  SITE = "/s/:slug",
  SITE_SEARCH = "/s/:slug/search",
  SITE_CAR = "/s/:slug/cars/:id",
  SITE_BOOK = "/s/:slug/book",
  SITE_BOOKING = "/s/:slug/booking/:token",
}

export enum SearchParams {
  LOCATION = "location",
  FROM = "from",
  TO = "to",
  VIEW = "view",
  TYPE = "type",
  SEATS = "seats",
  TRANSMISSION = "transmission",
  Q = "q",
  CAR_ID = "carId",
  COMPANY_SLUG = "companySlug",
  COMPANIES = "companies",
  PREVIEW = "preview",
  BRANCH = "branch",
  EDIT = "edit",
}

export enum SiteEditTab {
  LOOK = "look",
  RULES = "rules",
  DOMAIN = "domain",
}

export enum SiteEditSection {
  HERO = "hero",
  SEARCH = "search",
  FLEET = "fleet",
  BRANCHES = "branches",
  CONTACT = "contact",
  RULES = "rules",
  DOMAIN = "domain",
}

export enum ErrorMessages {
  UNKNOWN = "errors.unknown",
  NETWORK = "errors.network",
  VEHICLE_NOT_FOUND = "errors.vehicle.not_found",
  COMPANY_NOT_FOUND = "errors.company.not_found",
  RESERVATION_OVERLAP = "errors.reservation.overlap",
  RESERVATION_NOT_FOUND = "errors.reservation.not_found",
  RESERVATION_INVALID_DATES = "errors.reservation.invalid_dates",
  PRICING_MIN_DAYS = "errors.pricing.min_days",
  PRICING_MAX_DAYS = "errors.pricing.max_days",
  PRICING_RENTAL_TOO_LONG = "errors.pricing.rental_too_long",
  RESERVATION_MIN_LEAD = "errors.reservation.min_lead",
  RESERVATION_TERMS_REQUIRED = "errors.reservation.terms_required",
  RESERVATION_MAX_OPEN_REQUESTS = "errors.reservation.max_open_requests",
  RESERVATION_REQUEST_EXPIRED = "errors.reservation.request_expired",
  SITE_NOT_FOUND = "errors.site.not_found",
  SITE_PAUSED = "errors.site.paused",
  SITE_NOT_PUBLISHED = "errors.site.not_published",
  BOOKING_PAYMENT_NOT_REQUIRED = "errors.booking.payment_not_required",
  BOOKING_PAYMENT_WINDOW_ELAPSED = "errors.booking.payment_window_elapsed",
  BOOKING_PAYMENT_NOT_OPEN = "errors.booking.payment_not_open",
  RESERVATION_NOT_CANCELLABLE = "errors.reservation.not_cancellable",
  RENTAL_PAYMENTS_ALREADY_PAID = "errors.rental_payments.already_paid",
}
