# Benwer Cars Marketplace — Documentation

A consumer-facing Next.js (App Router) application serving two modes from a single
codebase: per-company branded subdomains and a global multi-company marketplace.

This folder is the **source of truth** for how we build this frontend. When a rule
here conflicts with older code, the docs win and the code should be migrated.

## Read in this order

| Doc                                                      | Read it when you want to know…                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------- |
| [agent-token-efficiency.md](./agent-token-efficiency.md) | How to work without burning a huge context                        |
| [product.md](./product.md)                               | What we're building, for whom, and the two operating modes        |
| [architecture.md](./architecture.md)                     | Middleware mode detection, routing, folder layout, data flow      |
| [engineering.md](./engineering.md)                       | Non-negotiable coding conventions (TS, i18n, errors, data, enums) |
| [ui-guidelines.md](./ui-guidelines.md)                   | Design system: tokens, components, layout, states, a11y           |
| [tech-decisions.md](./tech-decisions.md)                 | Libraries we use (and rejected) and why                           |
| [api-plan.md](./api-plan.md)                             | Public API contract the marketplace expects from the backend      |
| [testing.md](./testing.md)                               | How we test (Playwright e2e + Vitest unit)                        |
| [cicd.md](./cicd.md)                                     | Vercel branches, promote/rollback                                 |

## The 10-second version

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · React Query · next-intl.
- **Two modes, one codebase.** Proxy detects subdomain vs. global marketplace; injects `x-company-slug` header.
- **Server Components by default.** `"use client"` only for interactivity, browser APIs, React Query, or local state.
- **Layered data flow:** Component → React Query hook (`src/hooks`) → API service (`src/services/api`) → client.
- **No hardcoding:** colors from semantic Tailwind tokens; text from i18n; business strings from enums.
- **Every screen ships four states:** loading, empty, error, success.
- **Public by default.** Guest booking via name + email + phone; reservation tracked by confirmation token. Optional guest accounts (guest Firebase) on company sites and in the Benwer Cars guest app; staff Firebase only for owner edit mode.
- **Git:** never commit to `main`. Pull latest, branch, open a PR.

## Current setup status (important for agents)

Several pieces are chosen but not yet scaffolded — do not import them until they exist:

- ❌ Sentry (via `@/lib/logger`) — scaffold exists as a `console.error` wrapper. Wire Sentry when configured.
- ❌ React Testing Library — chosen for component unit tests, not installed yet. See [testing.md](./testing.md).
- ❌ MSW — chosen mock/dev layer; not set up yet. `public/mock-data/*.json` exists as isolated-test fixtures only (`BENWER_ALLOW_MOCK_CATALOGUE=1`); the running app never reads them.
- ✅ Vitest — installed for mapper/service unit tests (`npm test`).
- ✅ Public API client — `openapi-fetch` + generated `paths` (`npm run generate:api`) targets `/v1/public/*` when `NEXT_PUBLIC_API_URL` / `API_ORIGIN` is set. If the live API is unset or unreachable, screens show their error/empty state. Local, staging, and production never swap in mock cars or stock photos.
- ✅ next-intl — wired with shared ICU messages under `messages/<locale>/{common,marketplace}.json`. Two locales: **British English (`en-GB`)** and **Spain Spanish (`es-ES`)**.
- ✅ Semantic Tailwind tokens — defined in `src/app/globals.css`; per-tenant `--primary` override supported.
- ✅ Mode detection — `src/proxy.ts` injects `x-company-slug` from the host header and rewrites tenant traffic to `/tenant`.
