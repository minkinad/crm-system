# Operations Runbook

## Deployment preflight

- Build backend and frontend from lockfiles with `npm ci`.
- Run build, lint, tests, and dependency audits.
- Validate all production environment variables by starting the backend in a non-serving preflight
  environment.
- Back up PostgreSQL before migrations and verify the backup is readable.
- Review pending migrations and confirm their lock/downtime characteristics.
- Keep Swagger disabled and configure exact HTTPS CORS origins.

## Health model

- `GET /api/v1/health/live`: process is alive; do not use it to route traffic.
- `GET /api/v1/health/ready`: PostgreSQL and Redis are usable; use it for traffic readiness.

A live but unready instance should be removed from traffic without being restarted in a tight loop.
Investigate the named dependency first.

## Common incidents

### Elevated 401 responses

1. Check clock synchronization and recent JWT issuer/audience/secret changes.
2. Confirm refresh cookie path, Secure/SameSite behavior, and frontend API origin.
3. Check auth-session expiry/revocation counts without exposing token hashes.
4. If caused by a secret rotation, restore the coordinated configuration or require re-login.

### Elevated 403 CSRF responses

1. Confirm the CSRF cookie and `X-CSRF-Token` header are both present and equal.
2. Verify CORS origin and credential settings.
3. Check whether a frontend deployment changed the CSRF cookie name.
4. Do not bypass middleware as a mitigation.

### Elevated 429 responses

1. Inspect route, source IP, and `RateLimit-*` response headers.
2. Distinguish legitimate traffic growth from credential attacks or retry storms.
3. Adjust a route limit only with evidence and a security review.

### Readiness fails on PostgreSQL

1. Check connectivity, credentials, connection saturation, storage, and database logs.
2. Stop migrations if lock contention or a partial rollout is suspected.
3. Restore service using the deployment platform's normal rollback mechanism.
4. Never run destructive schema commands before confirming a tested backup.

### Readiness fails on Redis

1. Check connectivity, authentication, memory pressure, eviction, and persistence status.
2. Expect rate-limited endpoints to fail closed and queues/cache to degrade.
3. Restore Redis rather than disabling rate limiting or authentication.

### Suspected token compromise

1. Revoke affected auth sessions in PostgreSQL.
2. For broad compromise, rotate refresh then access secrets through the secret manager and require
   reauthentication.
3. Review audit events, request IDs, login sources, and WebSocket connections.
4. Preserve evidence and follow `SECURITY.md` disclosure handling.

## Migration and rollback

- Apply migrations once per release through a dedicated job, not from every API replica.
- Prefer backward-compatible expand/migrate/contract changes for zero-downtime releases.
- Roll back application code before schema only when the old code supports the new schema.
- Use a migration `down` only after reviewing data-loss implications; a database restore may be safer.

## Backup and recovery

Production must define encrypted PostgreSQL backups, retention, off-site copies, and restore drills.
Record recovery point and recovery time objectives outside the repository. Redis is operational state;
PostgreSQL remains the authoritative business record.

## Post-incident

Capture timeline, customer impact, detection gap, root cause, contributing factors, and corrective
actions. Convert architectural corrections into ADRs or explicit architecture backlog items.
