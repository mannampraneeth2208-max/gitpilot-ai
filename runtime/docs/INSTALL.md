# GitPilot installation

1. Run PostgreSQL and apply `db/001_initial.sql`; install pgvector or remove the vector column if semantic retrieval is not enabled.
2. Run n8n with a persistent `N8N_ENCRYPTION_KEY`, HTTPS, execution-data retention, and restricted workflow editor access.
3. Configure the environment variables from `.env.example`; do not commit real tokens.
4. In n8n create a PostgreSQL credential named `GitPilot PostgreSQL`.
5. Import all JSON files in `workflows/`. Keep workflows inactive until credentials and URLs are configured.
6. Provide an isolated worker implementing `docs/WORKER.md`. Never run repository code inside n8n.
7. Put an authenticated backend in front of the webhooks; validate user authorization, signature, request size, and idempotency.
8. Run the acceptance tests in `docs/TESTING.md` with a disposable GitHub repository.

This package is a functional, credential-neutral foundation. GitHub OAuth callback/token storage, provider-specific model selection, worker deployment, and notification delivery require your chosen infrastructure and must be configured before claiming production readiness.
