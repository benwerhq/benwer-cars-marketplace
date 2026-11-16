# Product

## What Benwer Cars Marketplace is

A consumer-facing platform where end customers browse available rental cars and make
reservations. It is part of the Benwer Cars ecosystem alongside the admin platform
(where rental companies manage their fleet) and the API (shared backend).

## Two operating modes

### 1. Tenant subdomain (`denver-cars.benwer.es`)

A rental company activates their branded storefront. Customers see only that company's
available cars, styled with the company's brand colours. The URL is their company slug
as a subdomain.

### 2. Global marketplace (`marketplace.benwer.es`)

A single marketplace listing cars from all participating companies. Customers can
search by company, location, or car type, then book from any company.

Both modes use the **same components, hooks, and booking flow**. The only difference is
how the active company context is resolved (from subdomain vs. from the URL path).

## Who uses it

End customers of rental companies — people who want to rent a car. They are not
operators. They can book without an account; an optional guest account (company
sites and the Benwer Cars app) keeps their bookings and linked companies. The
experience must be simple, visual, and fast.

## Pages

| Page                     | Mode        | Purpose                                                          |
| ------------------------ | ----------- | ---------------------------------------------------------------- |
| **Home**                 | Tenant      | Company hero + car grid + date search                            |
| **Home**                 | Marketplace | Company search + featured listings                               |
| **Companies**            | Marketplace | Browse participating companies on a Málaga-province map and list |
| **Company page**         | Marketplace | One company's car grid (same layout as tenant home)              |
| **Car detail**           | Both        | Photos, specs, price, availability calendar, booking CTA         |
| **Book**                 | Both        | Guest booking form (name, email, phone, dates)                   |
| **Booking confirmation** | Both        | Post-booking summary + confirmation token                        |
| **Booking status**       | Both        | Reservation lookup via token from confirmation email             |
| **Guest account**        | Tenant      | Optional sign-in, my bookings, link confirm, profile             |
| **Get the app**          | Marketplace | `/app`: the Benwer Cars guest app and its store badges           |

## Guest booking flow

No account required. Customer:

1. Selects a car and dates.
2. Fills in name, email, and phone number.
3. Confirms. The API creates the reservation and sends a confirmation email.
4. The email contains a link to `/booking/[token]` where the customer can track status.
   With the Benwer Cars app installed, the same link opens the trip in the app.

Signing in is optional. A signed-in guest (same guest account on company sites
and in the app) sees their bookings across the companies they are linked to.

## Benwer Cars guest app

A native iOS and Android app for guests (`benwerhq/benwer-cars-guest-mobile`):
marketplace search, native booking, trips across companies, push updates, and a
company mode opened from `{marketplace}/companies/{slug}` links or QR codes.
Bookings made in the app show as "Benwer app" in admin. The marketplace host
serves its universal link files and shows store badges once the store listings
exist. A company site's App section can show the shared app (toggle) or the
company's own store links. Plan: `docs/guest-app/plan.md`.

## Branding

Each company has a `primaryColor` and optional `logoUrl` stored in the API. In tenant
subdomain mode these are applied as CSS variables on `<html>` so all semantic token
classes (`bg-primary`, `text-primary`, etc.) automatically adopt the company's brand.
In global marketplace mode the Benwer Cars brand is used.

## Not in scope

Invoices, real-time chat. Build these only when explicitly specified. (Guest
accounts, payments and reviews now exist; see above and the guest app plan.)

## Domain status values

Resolved from enums in `src/enums` — never hardcode these strings.

- **Vehicle:** `available` · `reserved` · `rented` · `maintenance`
- **Reservation:** `draft` · `confirmed` · `active` · `completed` · `cancelled`
- Only vehicles where `status = available` and `isPublic = true` are shown.

> Business rules (overlap prevention, availability math, status transitions) are
> enforced by the **API**. The marketplace presents data and sends requests only.

## Publish controls (set in admin web)

- **Company level** — `isPublic: boolean`: whether the company appears on the
  global marketplace. A company can have their subdomain active without being listed
  globally.
- **Vehicle level** — `isPublic: boolean`: whether a specific car is listed publicly.
  A vehicle can be internal-only (visible in admin) without appearing on the
  marketplace.
