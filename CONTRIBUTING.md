# Contributing

## Development setup

Requirements: Node.js 22, npm, Docker Compose, PostgreSQL 16, and Redis 7.

1. Copy `.env.example` to `.env` and replace local secrets.
2. Install dependencies with `npm ci` in `backend/` and `frontend/`.
3. Start the stack with `docker compose up --build`, or run dependencies in Docker and applications
   with their development scripts.
4. Apply migrations before exercising API changes.

Never commit `.env`, credentials, production data, database dumps, or generated build output.

## Change workflow

1. Read `AGENTS.md` and the more specific guide for the area being changed.
2. For architectural work, read `docs/ARCHITECTURE.md` and relevant ADRs.
3. Keep changes focused and preserve unrelated working-tree edits.
4. Add or update tests with the implementation.
5. Run the required checks listed in `AGENTS.md`.
6. Use a Conventional Commit subject, for example `fix(auth): revoke reused refresh sessions`.

## Pull-request acceptance criteria

- Tenant scope and authorization behavior are explicit.
- Public endpoints are justified and marked `@Public()`.
- Database changes include a migration and rollback path.
- API or configuration changes update documentation and examples.
- New environment variables are validated and added to every relevant `.env.example`.
- Negative-path tests cover security-sensitive behavior.
- Build, lint, tests, and high-severity dependency audits pass.
- Logs and audit metadata contain no secrets or unnecessary personal data.

## Review guidance

Review in this order:

1. security and tenant isolation;
2. correctness and transaction boundaries;
3. migration and backward compatibility;
4. failure handling and observability;
5. maintainability and user experience.

Large refactors should be split into behavior-preserving structure changes and functional changes.
