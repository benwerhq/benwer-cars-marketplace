# Technology Decisions

Same stack as `benwer-cars-admin-web` unless noted. This doc calls out marketplace-specific
decisions and differences.

## Core (in repo)

| Area         | Choice                                                      | Version    |
| ------------ | ----------------------------------------------------------- | ---------- |
| Framework    | Next.js (App Router, non-standard build)                    | 16         |
| UI runtime   | React                                                       | 19         |
| Language     | TypeScript (strict)                                         | 5          |
| Styling      | Tailwind CSS v4 + semantic CSS-variable tokens              | 4          |
| Primitives   | Radix UI + `cva`/`cn`                                       | —          |
| Server state | TanStack React Query                                        | 5          |
| Icons        | lucide-react                                                | current    |
| i18n         | next-intl + ICU messages                                    | current    |
| Toasts       | sonner                                                      | 2          |
| Maps         | Google Maps (`@vis.gl/react-google-maps`); Leaflet fallback | 1.10 / 1.9 |

## Planned additions

| Need                  | Choice                                        | Why                                                             |
| --------------------- | --------------------------------------------- | --------------------------------------------------------------- |
| Forms + validation    | react-hook-form + zod                         | Same as admin web.                                              |
| Date picker           | react-day-picker (or built on Radix)          | Availability calendar needs a range picker with disabled dates. |
| List/filter URL state | nuqs                                          | Filters, dates, sort live in the URL — shareable, bookmarkable. |
| Dates                 | date-fns + date-fns-tz                        | ISO 8601 UTC transport, format at the edge.                     |
| API mocking           | MSW                                           | Real client runs everywhere; MSW intercepts in dev + tests.     |
| Unit tests            | Vitest + @testing-library/react               | Modern, fast, ESM-native.                                       |
| a11y                  | @axe-core/playwright + eslint-plugin-jsx-a11y | Regression coverage.                                            |
| Error monitoring      | Sentry via `@/lib/logger`                     | Swap-able; call sites never import the vendor.                  |
| Env validation        | @t3-oss/env-nextjs + zod                      | Fail fast on missing env at boot.                               |
| Typed API client      | openapi-fetch (generated from API spec)       | No hand-written DTOs; same spec as admin + mobile.              |

## Do NOT use (rejected)

| Rejected                                    | Use instead                     | Reason                                    |
| ------------------------------------------- | ------------------------------- | ----------------------------------------- |
| sweetalert2                                 | sonner (toasts) + Radix Dialog  | Off-brand, heavy.                         |
| Raw `fetch()` in components                 | hook → service → client         | Breaks the layered data flow.             |
| Redux / MobX                                | React Query + URL + local state | No global store need.                     |
| CSS-in-JS / inline `style={{theme.colors}}` | Tailwind semantic tokens        | Runtime cost, no `hover:`/`dark:` states. |
| Moment.js                                   | date-fns                        | Unmaintained, heavy, mutable.             |

## Marketplace-specific decisions

### No authentication

The marketplace is fully public. No login page, no session, no auth context, no
middleware auth guard. Guest checkout collects name/email/phone. The API issues a
`token` which the customer uses to look up their reservation.

### Subdomain routing

Next.js proxy (`src/proxy.ts`) reads the `host` header to detect which company's
subdomain is being served. The resolved `companySlug` is forwarded as an
`x-company-slug` request header so Server Components don't re-parse the host.
Tenant-host requests to `/` and `/cars/[id]` are rewritten to `/tenant` so those
pages do not collide with marketplace routes at build time. This works on Vercel,
Railway, and Fly.io — any platform that preserves the `host` header.

### Per-tenant colour theming

Company brand colour is applied as a CSS custom property (`--primary`) on `<html>`
in the tenant layout's Server Component. All downstream components use semantic
Tailwind tokens; no component-level changes are needed to support any reasonable
brand colour.

### Guest reservation confirmation email

The API uses **Resend** to send a transactional confirmation email on reservation
creation. The email contains a link to `/booking/[token]`. This is an API
infrastructure concern, not a frontend concern.

### Marketplace availability map

`/companies` uses **Google Maps** through `@vis.gl/react-google-maps` (dynamically imported
with `ssr: false`): vector map, Advanced Markers rendered as React (labelled pills styled with
semantic tokens), light/dark `colorScheme` following the site theme, and the selected company
card floating over the map instead of an InfoWindow.

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Maps JavaScript API key, HTTP-referrer restricted.
- `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` — vector Map ID (Advanced Markers need one). When unset the
  dev-only `DEMO_MAP_ID` is used; always set a real one on staging and production.

When the key is unset (local dev, CI) the map falls back to the previous **Leaflet +
react-leaflet** canvas with Esri Canvas Light/Dark Gray tiles (no API key). Carto’s public
tiles watermark “API KEY REQUIRED” and MapLibre has worker-loading issues with Next.js 16, so
both stay rejected.

Company pins use the company’s `latitude` / `longitude`, falling back to `locationSlug` →
`src/data/malagaCityCoordinates.ts`. Public branches carry no coordinates yet, so the map shows
one pin per company; per-branch pins need `latitude` / `longitude` on the public branch DTO.

The location dropdown on `/companies` lists **branches** (same `BranchCombobox` as `/cars`).
Picking one navigates to `/companies?branch=<id>`, narrowing the list to that branch’s company
and preselecting its pin. `?location=<city>` links (homepage map teaser) keep working.

### SEO

Consumer-facing pages require proper metadata. Every route exports `generateMetadata`
with per-page title, description, and Open Graph tags. Car detail pages include
JSON-LD structured data. The sitemap is generated at build time.
