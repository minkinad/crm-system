## What changed

Describe the user-visible result and architectural impact.

## Why

Explain the problem, constraints, and alternatives considered.

## Security and tenancy

- [ ] Authorization and tenant scope were reviewed.
- [ ] No public endpoint was added, or `@Public()` is justified.
- [ ] No credential, token, personal data, or secret is logged or persisted incorrectly.
- [ ] Negative-path security tests were added where relevant.

## Data and operations

- [ ] No schema change, or a reviewed migration and rollback plan are included.
- [ ] Configuration examples and operational documentation are updated.
- [ ] Architecture documentation/ADR is updated when boundaries or decisions changed.

## Verification

- [ ] Backend build, lint, tests, and dependency audit pass.
- [ ] Frontend build and dependency audit pass.
- [ ] Docker configuration/images were checked when Docker was available.
