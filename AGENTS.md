<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Benwer Cars Marketplace — Agent Orientation

Consumer-facing marketplace for Benwer Cars: a single Next.js app serving
per-company branded storefronts (tenant subdomains) and a global multi-company
marketplace. **Frontend only** — the API and other clients live in separate
repositories.

## Token efficiency (read first)

Follow [`docs/agent-token-efficiency.md`](./docs/agent-token-efficiency.md).
Repo-specific, high-impact rules:

- **Tests:** run one suite at a time; never the full suite to check one test.
- **Never** read `src/services/api/generated/**`, `coverage/`, or `.next/`.
- Scratch files go in the agent store — never in `scripts/`.
- Search before reading — never `Read` a large file whole.

## Before you code

**Do not write or edit code until these are read.** Nested docs are the source of
truth; do not start from generic Next/React memory.

1. Read [`docs/README.md`](./docs/README.md) — it indexes everything below.
2. Match the rule docs to your task:
   - [`docs/engineering.md`](./docs/engineering.md) — coding conventions (TS, i18n, data, errors, enums).
   - [`docs/ui-guidelines.md`](./docs/ui-guidelines.md) — design system, components, states, a11y.
   - [`docs/architecture.md`](./docs/architecture.md) — folders, layers, mode detection, data flow.
   - [`docs/tech-decisions.md`](./docs/tech-decisions.md) — which libraries we use (and rejected).
   - [`docs/api-plan.md`](./docs/api-plan.md) — what the backend API must provide (public endpoints).
   - [`docs/product.md`](./docs/product.md) — what & why, two modes, guest booking flow.
   - [`docs/testing.md`](./docs/testing.md) — Playwright e2e + Vitest unit.

## Mobile app (when touching `benwer-cars-admin-mobile`)

Read that repo’s `AGENTS.md` and `docs/mobile-guidelines.md`. **Hard rule:** respect
system bars — no buttons or footers under the home indicator or Android nav bar.

## Hard rules (the short list)

- **Server Components by default**; `"use client"` only when truly needed, at the leaves.
- **Never** hardcode colors (use semantic theme tokens), user text (use i18n `t()`), or business strings (use `src/enums`).
- **Never** `fetch()` in a component: Component → hook (`src/hooks`) → service (`src/services/api`) → client.
- Every screen handles **loading, empty, error, success**.
- No `any`. Self-documenting code; **do not comment code** unless truly necessary.
- Pages export a **named** component, never an anonymous default.
- **Never use raw `<img>`** — use `next/image` with explicit dimensions or `fill`.
- **Env vars** — new vars need a sample in `.env.example` and in the `.env.local` block below.
- **Git** — never commit to `main`. Pull latest `main`, branch from it, open a PR.

## Commands

```bash
npm run dev        # dev server (port 3002)
npm run build      # production build
npm run lint       # eslint
npm run test:e2e   # Playwright
```

## Local development (mandatory for agents)

This marketplace talks to **`benwer-cars-api`** on `http://localhost:8080/v1`.
Local **requires** that API plus its seed. The marketplace will not substitute
`public/mock-data` cars, companies, or photos when the API is down or empty.

### 1. Start the API (sibling repo)

```bash
cd ../benwer-cars-api
docker compose -f docker-compose-local.yml up --build
```

Confirm: `curl -s http://localhost:8080/health`
Confirm seed (`benwer-cars-api` `main` at `dda5afd` and later):
`curl -s http://localhost:8080/v1/public/companies` — **6 public companies**
with locations and `vehicleCount`, and **37 public vehicles** whose photos are
LocalStack URLs (`http://localhost:4566/...`, rewritten to `/localstack/...`).
If that catalogue is missing, reseed the **local** API — never point this app
at production. Denver Cars / `/mock-data/cars/*.jpg` means the marketplace is
still on the old mock path (this must not happen).

### 2. Start the marketplace

```bash
cd ../benwer-cars-marketplace
npm run dev
```

Open `http://localhost:3002`. Copy `.env.example` → `.env.local`. Sample:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3002/api
API_ORIGIN=http://localhost:8080
LOCALSTACK_ORIGIN=http://localhost:4566
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_MARKETPLACE_DOMAIN=benwer.es
NEXT_PUBLIC_ENV=local
NEXT_PUBLIC_MARKETING_URL=https://cars.benwer.es
# NEXT_PUBLIC_ADMIN_DEMO_URL=https://admin.cars.benwer.es
# NEXT_PUBLIC_ADMIN_URL=https://cars-admin.benwer.es
# NEXT_PUBLIC_GUEST_FIREBASE_API_KEY=
# NEXT_PUBLIC_GUEST_FIREBASE_AUTH_DOMAIN=
# NEXT_PUBLIC_GUEST_FIREBASE_PROJECT_ID=
# NEXT_PUBLIC_GUEST_FIREBASE_APP_ID=
# NEXT_PUBLIC_GUEST_FIREBASE_TENANT_ID=
# NEXT_PUBLIC_MEDIA_ORIGIN=https://dxxxx.cloudfront.net
```

In local dev, proxy detects `localhost` and defaults to **global marketplace
mode** (no subdomain). To test tenant mode locally, set a custom `hosts` entry:
`127.0.0.1 denver-cars.localhost` and update `NEXT_PUBLIC_MARKETPLACE_DOMAIN=localhost`.

### When to rebuild what

| You changed…             | Do this                                              |
| ------------------------ | ---------------------------------------------------- |
| API Go code / migrations | `docker compose … up --build` in `benwer-cars-api`   |
| API routes / swagger     | `make swag` in API, then `npm run generate:api` here |
| Marketplace UI only      | `npm run dev` (API can stay running)                 |

## Not yet scaffolded — build before importing

- ❌ **MSW** — not set up. `public/mock-data/*.json` is **not** an offline catalogue; live UI never falls back to it.
- ✅ **Typed public API client** — `openapi-fetch` + `src/services/api/schema.d.ts` (`npm run generate:api`).
- ❌ **RTL** — install before writing component unit tests.
- ✅ **Vitest** — mapper tests via `npm test`.
- ❌ **Sentry** — `@/lib/logger` exists as a `console.error` wrapper; wire Sentry when configured.
- ❌ **react-hook-form + zod** — install before building `BookingForm`.
- ❌ **nuqs** — install before adding URL-synced filters.
- ❌ **date-fns** — install before adding date formatting or the availability calendar.
- ❌ **shadcn/ui `cn()` / `cva`** — scaffolded in `src/lib/utils.ts`; install `class-variance-authority` and `clsx` before importing.
## Branch hygiene (mandatory)

**Before starting any work**, list local and remote branches (`git fetch --prune`, `git branch -a`). For each branch other than `master`/`main`/`staging`:
- Already merged (`git log origin/staging..<name>` empty, or its PR is merged) → clean it up (remote and local).
- In progress (unmerged commits, open PR, or unpushed work) → keep it.
- Unsure → keep it and highlight it to the user; never delete on a guess.

After every merge, clean up the branches it leaves behind. Only `master`/`main` and `staging` are long-lived.

- Delete the merged branch on the remote (`gh pr merge --delete-branch`, or the repo's auto-delete setting) and locally (`git branch -d <name>`, then `git fetch --prune`).
- Delete release/integration branches as soon as they are merged into `staging`/`master`.
- Before deleting, confirm nothing unmerged or unpushed is on the branch (`git log origin/staging..<name>`); name branches explicitly, never delete by pattern.
- Keep `staging` and `master`/`main` in sync after a release, with nothing left on local that is not pushed.
