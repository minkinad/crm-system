# Frontend Agent Guide

These instructions apply to `frontend/` and extend the repository-level `AGENTS.md`.

## Structure

- Pages compose use cases; reusable UI belongs in `components`; transport logic belongs in `api`;
  shared domain types belong in `shared`.
- Use the shared `apiClient` for authenticated API calls so refresh, CSRF, and error handling remain
  consistent.
- Use React Query for server state and Zustand only for small client/session state.
- Lazy-load route-level pages and avoid adding large dependencies for minor UI behavior.

## Security and tenancy

- Never store access tokens, refresh tokens, passwords, or session IDs in `localStorage` or
  `sessionStorage`.
- The non-authorizing CSRF nonce is the only session-related value allowed in browser storage.
- Never let users choose or override `tenantId` in API headers. The backend derives it from JWT.
- Render backend text as text. Do not introduce `dangerouslySetInnerHTML` without sanitization and a
  documented need.
- Keep CSP compatibility: scripts must be self-hosted and inline script execution is forbidden.

## UX and verification

- Preserve keyboard navigation, visible loading/error states, and accessible labels.
- Query keys must include every input that changes the response.
- Always run `npm run build` and `npm audit --audit-level=high` before handoff.
