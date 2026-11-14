# Architecture

Frontend-only Next.js App Router app. The API, admin web, and mobile app are
separate repositories; **all clients share the same API**, and **all business rules
live in that API** — the marketplace presents data and requests changes only.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
React Query · Radix primitives · lucide-react · next-intl.

## Two-mode rendering

One deployment, two entry-point experiences, determined by the request host:

```
host = "denver-cars.benwer.es"    →  tenant mode   →  slug = "denver-cars"
host = "marketplace.benwer.es"    →  global mode   →  slug = null
host = "localhost:3002"            →  global mode   →  slug = null (dev default)
```

The resolved `companySlug` is injected as a request header (`x-company-slug`) in
`src/proxy.ts`. Server Components read it via `headers()` without re-parsing
the host.

Route groups like `(marketplace)` and `(tenant)` do **not** create URL segments.
Both trees cannot own `/` or `/cars/[id]` at the same time — Next.js fails the
production build with a parallel-page collision. Tenant pages therefore live
under an internal prefix (`/tenant`, folder `src/app/tenant`). Proxy rewrites
tenant-host requests so the public URLs stay `/` and `/cars/[id]`. The prefix
is `tenant`, not `_tenant`: Next.js treats `_`-prefixed folders as private and
excludes them from routing.

Locale is cookie-based (`NEXT_LOCALE`) with no URL prefix. Proxy does not run
next-intl path routing: this app has no `[locale]` segment, and next-intl's
middleware would rewrite `/` to `/en-GB`, which 404s.

### Wildcard DNS

`*.benwer.es` must point to the marketplace deployment (wildcard `A`/`CNAME`).
`NEXT_PUBLIC_MARKETPLACE_DOMAIN=benwer.es` is the env var used by proxy to
distinguish subdomain requests from the main marketplace host.

## Route map

### Tenant subdomain (`denver-cars.benwer.es`)

```
/                         Company home — hero + car grid
/cars/[id]                Car detail + availability calendar + booking CTA
/book                     Booking form (query: carId, from, to)
/booking/[token]          Reservation status / confirmation
```

### Global marketplace (`marketplace.benwer.es`)

```
/                         Company search + featured listings
/cars                     Mixed-fleet search results (all companies)
/companies                All companies
/companies/[slug]         Company page — their car grid
/companies/[slug]/cars/[id]  Car detail (company context from URL)
/book                     Booking form (query: companySlug, carId, from, to)
/booking/[token]          Reservation status / confirmation
/app                      Benwer Cars guest app (store badges)
/.well-known/*            AASA + assetlinks for the guest app (this host only)
```

`/book` and `/booking/[token]` are route-group-free — they work for both modes.

## Folder structure

```
src/
  app/
    (marketplace)/        Global marketplace routes (layout wraps these)
      page.tsx             Company search home (/)
      cars/page.tsx        Mixed-fleet search results
      companies/
        page.tsx
        [slug]/
          page.tsx
          cars/[id]/page.tsx
    tenant/               Internal prefix only — public URLs stay / and /cars/[id]
      layout.tsx           Per-company --primary branding
      page.tsx             Company home (rewritten from /)
      cars/[id]/page.tsx   Car detail (rewritten from /cars/[id])
    book/
      page.tsx
    booking/[token]/
      page.tsx
    layout.tsx            Root layout — i18n, query, SEO, cookie banner
    globals.css           Tailwind v4 entry + design tokens
  components/
    ui/                   Shared primitives (Button, Badge, Field, Skeleton, …)
    layout/               MarketplaceHeader, Footer, CompanyBanner
    features/             CarCard, CarGrid, BookingForm, ReservationStatus, CompaniesMap
  hooks/                  React Query hooks
  services/api/           One file per domain + index barrel + client
  data/                   malagaCities, malagaCityCoordinates (map fallback)
  enums/                  Business string constants
  types/                  Shared domain types
  lib/                    logger, utils (cn/cva), errors, companyMap, marketplaceSearch
  i18n/                   next-intl routing + request config
  proxy.ts                Mode detection + tenant rewrites — host → x-company-slug
messages/
  en-GB/  common.json  marketplace.json
  es-ES/  common.json  marketplace.json
public/
  mock-data/             Isolated-test fixtures only — not served as live catalogue
```

## Rendering model

- **Server Components by default.** Route pages fetch data server-side and pass it
  down; use `HydrationBoundary` to seed React Query on the client.
- `"use client"` only for interactivity, browser APIs, React Query hooks, or local
  state — pushed to the **leaves**, not whole pages.

## Layers & data flow

```
Component  →  React Query hook (src/hooks)  →  API service (src/services/api)  →  client
```

- Components never call the client or `fetch()` directly.
- Hooks own caching, keys, and query/mutation state.
- Services own endpoints, grouped by domain.
- The **client** is the only place that touches the network.

### Current client

`src/services/api/client.ts` exposes:

- `getOpenApiClient()` — `openapi-fetch` client typed from `schema.d.ts`
  (`npm run generate:api`). No credentials middleware; public routes only.
  The server prefers `API_ORIGIN`. The browser uses `NEXT_PUBLIC_API_URL`
  when it is same-origin (`/api` or the marketplace host). Both must be the
  **API origin only** (`https://cars-api.benwer.es` or `http://localhost:8080`)
  if they point at the API — never `…/v1`. `openapi-fetch` concatenates
  `baseUrl + "/v1/public/..."`, so a `/v1` suffix produces
  `/v1/v1/public/...` (404). `normalizeApiBaseUrl` strips trailing `/v1`
  and request middleware collapses `/v1/v1` so either env form works.
  In staging/production the browser uses the same-origin `/api` BFF when
  `NEXT_PUBLIC_API_URL` is missing or points at a cross-origin API host
  (avoids CORS and the old mock fallback). Requests use `cache: "no-store"`.
- `mockClient.get<T>(path)` — reads `public/mock-data/*.json` **only** when
  `BENWER_ALLOW_MOCK_CATALOGUE=1` in a non-production local test. The live
  vehicles, companies, availability, and reservations services never call it.

Services call the live public API. If `API_ORIGIN` / `NEXT_PUBLIC_API_URL` is
unset, or the API is unreachable (network / DNS / timeout / CORS
`Failed to fetch`), the UI shows its error or empty state — never Denver Cars
or `/mock-data/cars/*.jpg`. `NEXT_PUBLIC_ENV=local` does **not** enable mock
catalogue data. HTTP 4xx and 5xx from a reachable API are surfaced as
`ApiError`. Unset `NEXT_PUBLIC_ENV` defaults to `production` when
`NODE_ENV=production`. List responses are `{ data, page }` (`unwrapList` reads
`response.data`; raw arrays remain a fallback). Mappers accept marketplace
aliases (`brand`, `type`, `pricePerDay`, `fuel`, `unavailableDates`) and admin
names (`make`, `category`, `dailyRate`, `fuelType`, `{ available, conflicts }`).

## Per-tenant branding

In tenant subdomain mode the root layout fetches the company's branding and applies it
as CSS custom properties on `<html>`:

```tsx
// app/tenant/layout.tsx (Server Component)
const company = await companiesApi.getBySlug(slug);
return (
  <html
    style={
      {
        "--primary": company.branding.primaryColor,
      } as React.CSSProperties
    }
  >
    …
  </html>
);
```

All components use semantic tokens (`bg-primary`, `text-primary`, etc.) and
automatically adopt the company's colour with no component changes needed.

## State management

- **Server state → React Query** (caching, refetch, invalidation).
- **UI state → local component state**, lifted only as far as needed.
- **List state (filters, dates) → URL** via `nuqs`.
- **Cross-cutting → context** (Theme, Query). No global store.

## Auth

Browsing and booking stay public: a guest can book with name, email and phone
and track the reservation through the confirmation token (`/booking/[token]`).
There is no middleware auth guard. Two optional Firebase sign-ins exist:

- **Guest accounts** (guest Firebase project, `NEXT_PUBLIC_GUEST_FIREBASE_*`) on
  company sites: `/s/[slug]/guest` sign-in, `guest/bookings`, `guest/confirm`
  (email-confirmed link to the company) and `guest/profile`. The guest Firebase
  ID token is the bearer for `/v1/public/companies/{slug}/guest/*`
  (`src/lib/guestAuth.client.ts`, `guestAccessToken.ts`). When the guest
  Firebase env vars are unset, the site shows a disabled state.
- **Staff owner edit mode** (staff Firebase, `NEXT_PUBLIC_STAFF_FIREBASE_*`) for
  `/s/[slug]/owner` and the in-site editor. Never mixed with guest Firebase.

The same guest accounts sign in to the **Benwer Cars guest app**
(`benwerhq/benwer-cars-guest-mobile`, iOS and Android), which uses
`/v1/public/guest/*`. See `docs/guest-app/plan.md`.

## Guest app links

The marketplace host is the universal link / App Link domain for the guest app.

- `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json`
  are Route Handlers (`src/app/.well-known/*`, `src/lib/guestApp.ts`). They
  answer only on the marketplace front door (`isMarketplaceFrontDoor`) and
  return 404 on company subdomains, custom domains, or while
  `GUEST_APP_APPLE_TEAM_ID` / `GUEST_APP_ANDROID_SHA256_FINGERPRINTS` are unset.
  App ids follow `NEXT_PUBLIC_ENV`: `com.benwer.cars.guest` on production,
  `com.benwer.cars.guest.staging` otherwise.
- `src/proxy.ts` passes `/.well-known/*` through untouched (no tenant rewrite,
  no redirect).
- Linked paths: `/booking/*`, `/companies/*`, `/trips*`, `/app*`.
- `/app` describes the app; store badges show on `/companies/[slug]`,
  `/booking/[token]` (and the company-site booking page when the site's App
  section uses the Benwer app), and the Smart App Banner (`itunes` metadata) is
  added on the marketplace host. All of them stay hidden until
  `NEXT_PUBLIC_GUEST_APP_IOS_URL` / `NEXT_PUBLIC_GUEST_APP_ANDROID_URL` are set.
- Company site App section: `appearance.app.benwerApp` switches the section to
  the shared store links, with a QR code to `{marketplace}/companies/{slug}`.
  Own `iosUrl` / `androidUrl` are still honoured when the toggle is off.

## Internationalization

User-facing text uses **next-intl** with **ICU MessageFormat**, namespaced as
`common` (shared) + `marketplace`. Locale comes from the `NEXT_LOCALE` cookie —
no locale-prefixed URLs. Two locales: **`en-GB`** and **`es-ES`**.

## Error handling

Errors are logged via `@/lib/logger` (wraps `console.error`; will forward to Sentry
when configured) and surfaced in the UI with the appropriate error state. Never
swallowed silently. See [engineering.md](./engineering.md#6-error-handling).
