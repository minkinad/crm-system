# ADR-0002: Derive tenant context from verified identity

- Status: Accepted
- Date: 2026-08-21

## Context

Accepting `tenantId` from a browser-controlled header creates a broken object authorization risk.
UUID identifiers do not prevent discovery or manipulation.

## Decision

The access JWT is the authoritative tenant source. A global guard validates JWT first and then
places its tenant claim into request context. Domain repositories still require a tenant predicate.
WebSocket rooms, cache keys, audit events, and queue payloads use the same verified identity.

## Consequences

- Clients do not send tenant-selection headers.
- Switching workspace requires issuing a token for that membership.
- Every protected request has a consistent tenant context before controller execution.
- Persistence scoping remains required as defense in depth.

## Alternatives considered

- Client tenant header plus comparison: rejected because it duplicates state and is easy to omit.
- Tenant in URL: useful for navigation but insufficient as an authorization source.
