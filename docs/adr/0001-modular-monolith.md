# ADR-0001: Use a modular monolith

- Status: Accepted
- Date: 2026-08-21

## Context

CRM domains share tenant identity, transactions, authorization, and a small operating team. Early
service extraction would add network failure modes and distributed consistency without established
independent ownership or scaling needs.

## Decision

Use one NestJS deployment organized into domain modules. A module owns its controllers, application
services, persistence interfaces, and entities. Cross-module access uses exported services or
explicit ports. PostgreSQL and Redis remain shared infrastructure.

## Consequences

- Local transactions and deployment remain simple.
- Module boundaries require code review rather than network enforcement.
- Individual modules cannot scale independently yet.
- A future extraction is possible after contracts and ownership stabilize.

## Alternatives considered

- Microservices now: rejected because operational and consistency cost exceeds current benefit.
- Layer-only monolith: rejected because feature ownership and boundaries become ambiguous.
