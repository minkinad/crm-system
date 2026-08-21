# CRM System Agent Guide

## Scope

These instructions apply to the entire repository. More specific `AGENTS.md` files in
`backend/` and `frontend/` refine them for those areas.

## Architecture invariants

- Treat the repository as a modular monolith with independently deployable frontend and backend.
- Keep domain code inside its module. Cross-module access goes through an exported service or an
  explicit interface, never another module's repository.
- The backend is private by default. New public HTTP endpoints require `@Public()` and a security
  justification in the change description.
- The authenticated JWT is the only source of tenant identity. Never trust tenant identifiers from
  headers, query parameters, route parameters, or request bodies.
- Every tenant-scoped database operation must include `tenantId` in its predicate.
- Do not persist access or refresh tokens in browser storage. The access token remains in memory;
  the refresh token remains in an HttpOnly cookie.
- Schema changes require a TypeORM migration. Never enable `synchronize`.
- Do not weaken CORS, CSRF, rate limiting, security headers, audit logging, or environment validation
  to make a feature easier to ship.

## Working agreement

- Preserve unrelated working-tree changes. At present, changes may exist outside your task.
- Prefer small Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:` or
  `perf:`.
- Update an ADR when changing an accepted architectural decision.
- Update `docs/ARCHITECTURE.md` when module boundaries, request flow, deployment topology, or data
  ownership changes.
- Add tests for authorization boundaries, tenant isolation, token lifecycle, migrations, and other
  security-sensitive behavior.

## Required checks

Before handing off a change, run the relevant checks:

```bash
cd backend
npm run build
npm run lint
npm test -- --runInBand
npm audit --audit-level=high

cd ../frontend
npm run build
npm audit --audit-level=high
```

When Docker is available, also run `docker compose config` and build the affected images.

## Documentation map

- `docs/ARCHITECTURE.md` — system structure, boundaries, flows, and evolution strategy.
- `docs/adr/` — architectural decisions and their consequences.
- `docs/operations/runbook.md` — operational checks and incident procedures.
- `CONTRIBUTING.md` — contribution workflow and acceptance criteria.
- `SECURITY.md` — vulnerability reporting and supported security posture.
