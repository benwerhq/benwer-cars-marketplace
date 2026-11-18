# CI/CD — Marketplace

Hosted on Vercel. Production is `cars.benwer.es`; staging is
`staging.cars.benwer.es`. Wildcard `*.benwer.es` and `*.staging.benwer.es`
serve company sites. Legacy `marketplace.benwer.es` /
`marketplace.cars.benwer.es` / `staging.cars-marketplace.benwer.es` 308 to the
new hosts at Vercel.

OpenAPI types come from committed [`src/services/api/schema.d.ts`](../src/services/api/schema.d.ts)
(fallback in `scripts/generate-api.mjs` when the live API is unreachable).

| Branch    | Deploy       |
| --------- | ------------ |
| PR        | Preview      |
| `staging` | Staging host |
| `main`    | Production   |

Promote / rollback: `vercel promote` / `vercel rollback`. See workspace `docs/cicd.md`.
