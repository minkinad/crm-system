# Security Policy

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private vulnerability
reporting/security-advisory feature for this repository. Include:

- affected endpoint or component;
- prerequisites and impact;
- minimal reproduction steps;
- relevant logs with credentials and personal data removed;
- suggested mitigation, if known.

Avoid accessing data that does not belong to you, degrading shared services, or retaining copied
data. Allow maintainers reasonable time to investigate and release a fix before disclosure.

## Response targets

These are operating targets, not a legal service-level agreement:

| Severity | Initial triage | Remediation target |
|---|---:|---:|
| Critical | 1 business day | 72 hours |
| High | 2 business days | 7 days |
| Medium | 5 business days | 30 days |
| Low | 10 business days | Planned release |

## Supported versions

Security fixes are applied to the current `main` branch. Deployments should use a reviewed commit,
run migrations, and provide production values that pass environment validation.

## Security baseline

- HTTPS/WSS at the ingress.
- Different access and refresh secrets of at least 32 bytes.
- Secure refresh cookies, HTTPS-only CORS origins, and Swagger disabled in production.
- Authenticated, server-derived tenant context for HTTP and realtime.
- High-severity dependency audit in CI.
- PostgreSQL/Redis kept off public interfaces and protected with strong credentials.

See `docs/ARCHITECTURE.md` and `docs/operations/runbook.md` for boundaries and incident procedures.
