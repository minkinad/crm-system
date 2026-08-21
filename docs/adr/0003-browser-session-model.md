# ADR-0003: Use memory-only access tokens and rotated refresh cookies

- Status: Accepted
- Date: 2026-08-21

## Context

Persisting bearer tokens in Web Storage makes them available to any script executing in the origin.
Pure cookie sessions simplify JavaScript but require a broader backend change and careful CSRF
handling.

## Decision

Keep short-lived access JWTs only in SPA memory. Store refresh JWTs in scoped HttpOnly cookies and
their bcrypt hashes in PostgreSQL. Restore sessions through a CSRF-protected, single-flight refresh.
Serialize rotation and revoke a session when an old refresh token is reused.

Centralize persistence, rotation, reuse detection, revocation, and active-session checks in the
backend `sessions` module. Authentication, user lifecycle, and realtime delivery consume that
module's service instead of accessing the session repository directly.

## Consequences

- Reloading the SPA performs one refresh call.
- XSS cannot read either bearer token from persistent browser storage.
- CSRF remains a required control for cookie-backed refresh and mutations.
- The non-authorizing CSRF nonce may persist in local storage.
- Session security rules have one implementation and one persistence owner.

## Alternatives considered

- Access JWT in local storage: rejected due to token theft impact.
- Refresh JWT exposed to JavaScript: rejected due to long-lived credential exposure.
- Backend-for-frontend session: viable future option if frontend and API are deployed same-origin.
