# Backend Agent Guide

These instructions apply to `backend/` and extend the repository-level `AGENTS.md`.

## Module boundaries

- Controllers translate HTTP input/output and declare authorization metadata. Keep business logic
  out of controllers.
- Services own use cases, transactions, authorization invariants that depend on domain state, and
  event publication.
- Repositories own persistence queries. Repository interfaces belong to the consuming domain.
- Entities describe persistence, not API contracts. Never return secret columns or accept entities
  as request DTOs.
- Infrastructure modules (`database`, `queues`, `realtime`) must not import feature controllers.

## Security rules

- HTTP authentication, tenant context, and RBAC are global guards. Do not add repetitive
  controller-level guards.
- Use `@Public()` only for intentionally anonymous endpoints. Refresh endpoints still require the
  dedicated refresh guard and CSRF middleware.
- Obtain tenant scope from `req.tenantId`, which is populated from the verified access token.
- Include `tenantId` in reads, updates, deletes, cache keys, queue payloads, audit events, and
  realtime rooms.
- Validate referenced entity IDs within the same tenant before creating cross-entity links.
- Use transactions for multi-aggregate writes and pessimistic/optimistic concurrency where races
  can violate security or business invariants.
- Hash passwords and refresh tokens asynchronously. Never log credentials, tokens, cookies, or full
  request bodies.

## Data and API changes

- DTOs must use `class-validator`; global whitelist and `forbidNonWhitelisted` are intentional.
- Keep URI versioning and document breaking API changes.
- Add a forward and reversible migration for schema changes. Test migrations against a clean
  database when Docker is available.
- Prefer explicit repository methods over unscoped generic access in services.

## Verification

Run build, ESLint, Jest, and `npm audit --audit-level=high`. Security boundary changes require a
negative test proving unauthorized access is rejected.
