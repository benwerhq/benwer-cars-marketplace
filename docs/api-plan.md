# API Plan — Public Endpoints

Requirements for the **public surface** of `benwer-cars-api` that serves this
marketplace. All endpoints are **unauthenticated**. They must be added under
`/v1/public/` to keep them separate from the authenticated tenant routes.

This is a frontend-authored contract — the API lives in its own repository.

---

## 1. Principles

- All endpoints under `/v1/public/` — no auth required, no session cookie.
- Rate-limited: `429 + Retry-After` to prevent abuse.
- Same RFC 9457 Problem Details error shape as authenticated routes.
- Only companies with `isPublic = true` are returned.
- Only vehicles with `isPublic = true` AND `status = available` are returned.
- Locale-independent: returns codes/enums; clients localize.

---

## 2. Company `slug` field (API change required)

Every company needs a stable, URL-safe, unique `slug` field:

- Set on company creation (from the company name, slugified).
- Immutable via self-service; changeable by platform admin only.
- Validated unique across all tenants.
- Used for: subdomain (`denver-cars.benwer.es`), URL paths (`/companies/denver-cars`),
  and all public API paths (`/v1/public/companies/denver-cars/…`).

Add `slug` to the `Company` resource in the OpenAPI spec.

---

## 3. Publish controls (API changes required)

Two new boolean fields, both default `false`:

**On `Company`:** `isPublic: boolean`

- When `true`, the company appears on the global marketplace.
- A company can have their subdomain active while `isPublic = false` (private storefront).

**On `Vehicle`:** `isPublic: boolean`

- When `true`, the vehicle is listed on the public marketplace.
- Independent of the internal `status` field.

Both are settable by `owner` or `manager` roles from admin web Settings.

---

## 4. Endpoints

### Companies (global marketplace)

```
GET  /v1/public/companies
```

Response: `{ data: Company[], page: { total, nextCursor } }`

Query params: `?q=` (search by name/location), `?location=&from=&to=`, `?cursor=&limit=`.

Returns companies where `isPublic = true`. Local `benwer-cars-api` seed
(`main` at `dda5afd` and later) exposes **6 public companies** with locations
and `vehicleCount`, plus **37 public vehicles** with LocalStack photo URLs.
Do not point the marketplace at production to fill that catalogue — reseed
the local API if counts or photos are wrong.

Company fields include `slug`, branding, `location` / `locationSlug`, optional
`latitude` / `longitude`, and `vehicleCount`. The marketplace map prefers API
coordinates and falls back to `src/data/malagaCityCoordinates.ts` city
centroids when lat/lng are omitted. The live API is the only catalogue source;
`vehicleCount` comes from the public companies payload, not mock JSON.

---

```
GET  /v1/public/companies/{slug}
```

Response: `Company & { branding: { primaryColor, logoUrl } }`

Returns the company profile + branding for layout injection. Used by both subdomain
and global marketplace modes. Returns `404` for unknown slug or `isPublic = false`
(unless the subdomain was accessed directly — treat as private storefront, show
company data but not on global listing).

---

### Vehicles

```
GET  /v1/public/companies/{slug}/vehicles
```

Response: `{ data: Vehicle[], page: { total, nextCursor } }`

Query params: `?type=&seats=&transmission=&from=&to=&q=&sort=pricePerDay:asc&cursor=&limit=`

Returns vehicles where `isPublic = true` AND `status = available`. When `from`/`to`
are provided, also excludes vehicles with conflicting confirmed/active reservations.

---

```
GET  /v1/public/companies/{slug}/vehicles/{id}
```

Response: `Vehicle` (full detail including `photos`, `description`).

---

### Availability

```
GET  /v1/public/companies/{slug}/availability
```

Query params: `?from=&to=&vehicleId=` (vehicleId optional — if omitted, returns for
all public vehicles in the company).

Response: `[{ vehicleId, unavailableDates, available }]` (required `from`/`to`;
`vehicleId` optional). Clients also accept a `{ data, page }` envelope.

---

### Reservations (guest booking)

```
POST /v1/public/companies/{slug}/reservations
```

Request body:

```json
{
  "vehicleId": "string",
  "startDate": "2026-09-15",
  "endDate": "2026-09-20",
  "guestName": "string",
  "guestEmail": "string",
  "guestPhone": "string"
}
```

Response: `GuestReservation` (includes `token`, `totalPrice`, `currency`).

On success:

- API creates the reservation with `status = confirmed`.
- Sends a confirmation email via **Resend** to `guestEmail` with:
  - Reservation summary (vehicle, dates, total).
  - Link to `GET /booking/[token]` on the marketplace.
- Returns the full `GuestReservation` object.

Errors:

- `409 reservation.overlap` — dates conflict with existing reservation.
- `400` field validation errors with per-field `errors[]`.
- `404 vehicle.not_found` — vehicle doesn't exist or isn't public.

---

```
GET  /v1/public/reservations/{token}
```

Response: `GuestReservation & { vehicle: Vehicle, company: Company }`

Returns the full reservation with vehicle and company detail for the status page.
Returns `404 reservation.not_found` for unknown or expired tokens.

---

## 5. Error shape

Same RFC 9457 Problem Details as authenticated routes:

```json
{
  "type": "https://benwer.es/errors/reservation.overlap",
  "title": "Reservation conflict",
  "status": 409,
  "code": "reservation.overlap",
  "detail": "Vehicle v1 has a confirmed reservation from 2026-09-15 to 2026-09-18."
}
```

`code` maps 1:1 to i18n keys (`errors.reservation.overlap`) on the frontend.

---

## 6. Infrastructure

### Email (Resend)

The API uses **Resend** for transactional emails. Required on reservation creation.
Configure via env var: `RESEND_API_KEY`.

### Rate limiting

Public endpoints are rate-limited per IP:

- `GET` endpoints: 100 req/min.
- `POST /reservations`: 10 req/min (stricter to prevent spam bookings).

### CORS

Allow the marketplace origins: `marketplace.benwer.es`, `*.benwer.es`, and
`localhost:3002` (dev). Credentials not required (no cookies).

---

## 7. Deliverables checklist (for the API repo)

- [ ] `slug` field on `Company` resource (unique, immutable, in OpenAPI spec).
- [ ] `isPublic` on `Company` and `Vehicle` (default `false`, settable by manager/owner).
- [ ] All `/v1/public/` endpoints implemented, rate-limited, CORS-allowed.
- [ ] Resend integration for guest reservation confirmation email.
- [ ] Public endpoints in the OpenAPI spec (for client generation).
- [ ] Website `content` JSON stored, validated and returned (see §9).

---

## 8. Live API notes (marketplace client)

**Source of truth (in flight):** [benwer-cars-api#20](https://github.com/rafaelbenetti/benwer-cars-api/pull/20)
(open — do not assume merged). That PR fills public `photos[]` / `photoUrl` from
the same attachments (`kind=vehicle_photo`) + stock_photo fallback admin uses,
maps invalid `type=car` to economy/sedan/other, and fixes CORS 403 on
`/v1/public/*` for `marketplace.benwer.es`. Until it ships, public vehicles may
**Never run `db/seed/seed.sql` on production** (it truncates). Image upload
only: `./db/seed/upload-seed-images-to-s3.sh` per the API `db/seed/README.md`.
Local seed on API `main` (`dda5afd+`) already has 6 public companies and 37
vehicles with LocalStack photo URLs — reseed locally if that is missing; do
not call production APIs from this app.

The marketplace always uses the live API (`API_ORIGIN` / `NEXT_PUBLIC_API_URL`).
Local needs `benwer-cars-api` running with seed data — the app will not fake a
catalogue. If those URLs are unset or the API is unreachable (network / CORS
`Failed to fetch`), show an error or empty catalogue, never
`/mock-data/cars/*.jpg`. `NEXT_PUBLIC_ENV=local` does not enable mock JSON.

| Contract                                                                                                                                                                                                                                                                                            | Marketplace handling                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List endpoints return `{ data, page }`, not raw arrays.                                                                                                                                                                                                                                             | `unwrapList` reads `payload.data` first. Raw arrays (older deploys) still unwrap. Isolated-test fixtures under `public/mock-data/*.json` use the same envelope but are not read by the running app.                                                                                                                                                                                                                                                                              |
| Companies accept `location`, `from`/`to`, `q`, cursor pagination. Fields include `slug`, branding, `location`/`locationSlug`, optional lat/lng, `vehicleCount`. Local seed (`dda5afd+`) has 6 public companies with those fields and 37 vehicles with LocalStack photo URLs.                        | Live client sends those query params, including province-wide `malaga`. Client-side city filtering skips `malaga`. Map pins prefer API coordinates. Never fill gaps from production or `public/mock-data`.                                                                                                                                                                                                                                                                       |
| Vehicle `type`/`category` query values are `economy\|sedan\|suv\|minivan\|van\|other`. `type=car` is invalid on current API (empty list).                                                                                                                                                           | Marketplace never sends `type=car`. UI “Car” omits the query and filters economy/sedan/other/`car` client-side after mapping. SUV/van send `suv`/`van`.                                                                                                                                                                                                                                                                                                                          |
| Vehicles expose aliases `brand`, `type`, `pricePerDay`, `fuel` plus admin names (`make`, `category`, `dailyRate`, `fuelType`). Photos may be `photos[]`, `photoUrl`, or attachments `kind=vehicle_photo` (stock_photo fallback). CDN/S3 URLs, protocol-relative hosts, signed URLs, or object keys. | Mapper prefers marketplace aliases, then admin names. Attachment `vehicle_photo` wins over `stock_photo`. `http(s)` and `//host/...` photo URLs are passed to `next/image`. Bare keys and `s3://bucket/key` are prefixed with `NEXT_PUBLIC_MEDIA_ORIGIN` when set; otherwise they are dropped and the UI shows the photo empty-state (never a mock Corolla/SUV/Tesla jpg). LocalStack hosts (`localhost:4566`, `127.0.0.1:4566`) are rewritten to same-origin `/localstack/...`. |
| Empty public fleets (`is_public=false` on vehicles) are expected. Admin still cannot set that flag on create/update.                                                                                                                                                                                | Company page is not an error: empty state explains the fleet is not public yet.                                                                                                                                                                                                                                                                                                                                                                                                  |
| Availability: required `from`/`to`; optional `vehicleId`; shape `[{ vehicleId, unavailableDates, available }]`.                                                                                                                                                                                     | One GET; `mapAvailabilityList` accepts a raw array, `{ data }`, or a single legacy `{ available, vehicleId, conflicts }` object.                                                                                                                                                                                                                                                                                                                                                 |
| Guest POST reservations + GET by token with nested `vehicle` + `company`. `409 reservation.overlap`. RFC 9457 validation.                                                                                                                                                                           | `mapReservation` reads nested resources, `grandTotal`/`totalAmount`, and `customer`. Field aliases (`vehicleID`, `after_start`). Empty 409 → `reservation.overlap`.                                                                                                                                                                                                                                                                                                              |
| CORS allows `localhost:3002` and, after API #20, `marketplace.benwer.es`. Production previously got CORS 403 on `/v1/public/*` and the client fell back to mock jpgs.                                                                                                                               | Set `API_ORIGIN` to the API **origin** (`https://cars-api.benwer.es`), never `…/v1`. The client strips `/v1` and collapses `/v1/v1`. In production the browser prefers the same-origin `/api` BFF when `NEXT_PUBLIC_API_URL` is cross-origin. CORS or API failure surfaces as an error — it must not revive mock photos.                                                                                                                                                         |

`npm run generate:api` uses `openapi/public.json` until production swagger
includes `/public/` paths. Keep the raw-array unwrap so an older Railway
deploy does not blank the marketplace.

---

## 9. Website appearance (booking sites)

The storefront and the owner editor use the API's `appearance` object
(`benwer-cars-api` `src/features/websites`), not a separate content field.

- `GET /v1/settings/website` returns the draft `appearance`, `publishedAppearance`,
  `revision`, `status` and `canPublish`.
- `PATCH /v1/settings/website` saves the draft. It needs the current `revision`
  (stale → `409 website.revision_stale`) and the full `appearance`; the schema is strict.
- `POST /v1/settings/website/publish` copies the draft to the live site;
  `POST /v1/settings/website/pause` takes it offline.
- `GET /v1/public/sites/{slug}` returns the published `appearance` and approved `reviews`
  (`{ average, count, items[{ rating, text, createdAt }] }`).

`appearance` holds `hero`, `template` (always `classic` for launch), `theme`
(brand colour, ≥ 4.5:1 contrast with white), `sections` (`hero, search, company,
fleet, included, reviews, app, branches, extras, faq, contact`; FAQ items live in the
`faq` section), `banners` (≤ 3; preset collage or uploaded `website_hero` image,
localised script/highlight/joiner/boxed/description/CTA text, CTA target),
`bannerTheme` (nine `#RRGGBB` colours), `included` (≤ 6), `app` (https store links)
and `contact` (WhatsApp, reply hours, payment methods). Fields the API does not
know are rejected, so the marketplace round-trips the draft it received.

Reviews are written by guests and moderated in Benwer admin; the editor only shows
the summary. Banner image upload uses `POST /v1/uploads?kind=website_hero`
(editor upload UI is a follow-up; presets cover launch).
