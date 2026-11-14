# Guest app — phased delivery

Source plan: [plan.md](./plan.md). Live status: [status.md](./status.md).
This file is the brief every phase agent works from. One fresh agent session per
phase (a clean context is the "compact" between phases).

## Decisions taken (2026-11-14)

| # | Decision | Choice |
| --- | --- | --- |
| 1 | Cross-company linking | **Rule A — links only.** No auto-claim by email across companies. |
| 2 | Booking in v1 | **Native booking from day one** (extras, insurance, PaymentSheet). Web handoff only as an error fallback. |
| 3 | Tests | **No tests are run yet.** Agents write tests alongside code but do not run test suites (unit, e2e, Maestro) until Rafael approves. |
| 4 | Merging | **Agents merge their own PRs into `staging`.** Never into `main`/`master`, never production. |
| — | Repo / app name | Plan defaults: repo `benwerhq/benwer-cars-guest-mobile`, app "Benwer Cars", packages `com.benwer.cars.guest(.staging)`. |
| — | Still open | Apple Developer account (billing, Rafael only), site editor custom store links (#5), push trigger list (#6, use plan list), company subdomains opening the app (#7, later). |

## Rules for every phase agent

1. Read the target repo's `AGENTS.md`/`CLAUDE.md` and docs before coding. The guest app copies the
   **admin mobile stack** exactly: `benwerhq/benwer-cars-admin-mobile`, branch `staging`
   (Expo 58, RN 0.88, expo-router, TS strict, TanStack Query, react-hook-form, zod, openapi-fetch,
   i18next ICU en-GB/es-ES/pt-PT, semantic theme tokens, Sentry de.sentry.io, Mixpanel EU).
   Read its `AGENTS.md` and `docs/mobile-guidelines.md`. Hard rule: nothing under system bars.
2. Work on a feature branch cut from `staging`, open a PR into `staging`, merge it yourself when the
   PR is complete. Merge only when the repo's existing automatic CI checks are green (or the repo has
   none); do not start extra test runs yourself. Delete the branch after merge.
3. No tests run (decision 3). Allowed: install deps, `typecheck`/`build` only if needed to make sure
   the code compiles — no lint/unit/e2e suites. Write the tests the plan names so they are ready.
4. Never touch production: no `master`/`main` merges, no production builds or store uploads, no
   production env vars, no billing changes. Stripe test keys only. No secrets in repos or PRs.
5. CI for the guest repo uses GitHub-hosted `ubuntu-latest` runners only. Do not touch self-hosted
   PC runners or Blacksmith.
6. Infra stays in the EU and on free plans (plan "Rules this plan follows").
7. Blocked on something only Rafael can do (account, console, secret, decision)? Write it under
   **Blocked** in `status.md` with exactly what is needed, set the phase to `blocked`, and stop.
8. When the phase is done, update `status.md` (phase → `done`, PR links, notes for the next phase)
   on `benwer-cars-marketplace` `staging` with a docs-only commit (`[skip ci]`), then end.

## Phases

### Phase 0 — Accounts and repo (Rafael)
Not agent work. Needed before phase 2 can start:
- Create empty repo `benwerhq/benwer-cars-guest-mobile` (agents cannot create repos).
- Firebase: Android + iOS apps in `benwer-cars-guest-staging`; Apple provider later.
- Sentry project `benwer-cars-guest-mobile` (free, de.sentry.io), Play Console staging app.
- Apple Developer account decision (blocks iOS builds and Sign in with Apple only).

### Phase 1 — API foundations · repo `benwer-cars-api`
Plan section "API changes". Deliver:
- `/v1/public/guest/*`: `GET me`, `GET reservations` (scope, cursor), `GET reservations/{id}`,
  `POST claim`, `PUT|DELETE devices/push-token`, `DELETE me` (409 `guest.erasure_blocked`).
  Guest Firebase bearer, staff tokens rejected, rate limits like existing guest routes.
- Linking **rule A** only.
- `guest_device_tokens` table + migration; FCM sender on `GuestFirebaseService`; triggers from the
  plan list hooked where guest emails are sent; locale copy; payload only ids; token cleanup.
- Full account deletion flow (4 steps in plan).
- Booking channel value "Benwer app".
- Anything native booking needs that the public API lacks (check what the marketplace `/s/[slug]/book`
  and `/s/[slug]/cart` flows call; insurance/extras/price-quote/PaymentSheet params).
- Export public + guest OpenAPI (file the app will commit as `openapi/public-v1.json`).
- e2e seed: one guest linked at two companies, upcoming + past bookings (write it, do not run).

### Phase 2 — App scaffold and core · repo `benwer-cars-guest-mobile`
Requires phase 1 done and the repo to exist. Copy the admin mobile skeleton (plan "Admin mobile
patterns" and "App architecture" tables): `app.config.js` flavours, `eas.json`
(`alpha-staging`, `production`, plus iOS profiles), env parsing, Sentry, Mixpanel, i18n + checker
scripts, theme tokens, http-client, session-expiry, `+native-intent.ts`, CI (`ci.yml`, `e2e.yml` on
`ubuntu-latest`). Then:
- `GuestAuthContext`: email/password, Google, Apple (Apple wired but behind config until the
  account exists); bearer = Firebase ID token. Sign-in, sign-up, forgot password, verify email.
- Tabs Explore / Trips / Account. Explore public: marketplace home, cross-company car search,
  companies list, car detail.
- Trips: upcoming/past across companies, trip detail with status, car, dates, price, pay
  (Stripe PaymentSheet with `connectedAccountId`), cancellation quote, cancel, withdraw, review.
- `trip/token/[token]` from email links; offer sign-in to save it (claim).
- Account: profile, linked companies + unlink, language, appearance, sign out, full delete.
- Push registration to `/v1/public/guest/devices/push-token`, tap → trip detail.

### Phase 3 — Native booking · repo `benwer-cars-guest-mobile` (+ API gaps)
Match the marketplace booking flow (`src/app/s/[slug]/cars/[id]`, `/cart`, `/book`, `/book` global,
`/booking/[token]`): dates + locations, availability, price quote, extras, insurance, driver details,
guest bearer on `POST /companies/{slug}/reservations` (auto-link), PaymentSheet, confirmation →
trip detail. Web handoff only as a fallback on error.

### Phase 4 — Company mode and links · guest app + marketplace + admin
- App: `c/[slug]` stack themed from `GET /v1/public/sites/{slug}` (brandColor accent, contrast
  foreground, dark logo), company home (hero, fleet, contact, WhatsApp), switcher sheet, saved mode,
  visibility states (`bookingWebsite`, `marketplace`).
- Marketplace (this repo): `/.well-known/apple-app-site-association` and `assetlinks.json` on the
  marketplace host only (staging host → `.staging` ids), proxy must not rewrite `/.well-known`,
  `/app` page, store badges on `/companies/{slug}` and `/booking/{token}`, Smart App Banner.
- Site editor App section toggle (`benwer-cars-admin-web` + API site DTO; keep `iosUrl`/`androidUrl`
  readable). "Benwer app" channel badge in admin web and admin mobile.
- Update marketplace `docs/architecture.md` and `product.md` (guest auth now exists).

### Phase 5 — Website parity sweep · guest app (+ API as needed)
Compare every marketplace route against the app and close gaps until functionality matches:
`(marketplace)` home, `/cars` search + filters (admin-style filters), `/companies`,
`/companies/[slug]`, `/companies/[slug]/cars/[id]`, `/book`, `/booking/[token]`, `/s/[slug]` home,
`/search`, `/cars/[id]`, `/cart`, `/book`, `/booking/[token]`, `/guest` (`bookings`, `confirm`,
`profile`), `/owner`, `/contact`, legal pages (privacy, terms, cookies — open in app or web view).
Record a parity table in `status.md` (route → app screen → ✅/❌). Repeat until all ✅ or a row is
explicitly out of scope (store-rule or Rafael decision). Each gap round is its own PR.

### Phase 6 — Staging hardening (needs Rafael's test approval)
Run e2e journeys, Maestro native checks, store listings, privacy labels. Watcher must not start it
until `status.md` says tests are approved.

### Phase 7 — Production (Rafael only)
Never started by an agent.
