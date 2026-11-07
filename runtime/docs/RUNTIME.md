# Runtime implementation

The package now includes a dependency-light API gateway and an isolated worker service. The gateway validates `X-GitPilot-Signature: sha256=<HMAC-SHA256>` using `GITPILOT_WEBHOOK_SECRET`, provides idempotency for task requests, routes requests to n8n, and exposes task status. The worker runs as a non-root container, clones into an ephemeral workspace, creates a branch, executes only allowlisted commands, applies timeouts, redacts logs, and returns structured results.

## Model provider

The local `.env` has been configured for the supplied OpenRouter-compatible key and OpenRouter chat-completions endpoint. The file is ignored and excluded from the distributable archive. Rotate the key if necessary and configure a specific verified model name before production use.

## Gmail

Gmail is optional and used only for failure notifications. It is disabled by default. GitPilot does not use Gmail passwords and does not search the mailbox for API keys or credentials. To enable notifications, supply a short-lived Gmail OAuth access token and explicit `GMAIL_FROM`/`GMAIL_TO` values through a secret manager. GitHub tokens, model-provider credentials, n8n encryption keys, and worker secrets must remain in the deployment secret manager; Gmail does not replace them.

## Run

```bash
cp .env.runtime.example .env
# edit every replace-* value; preserve your local model key if desired
npm test
docker compose up -d --build
```

Import the workflows from `workflows/` into n8n, create the `GitPilot PostgreSQL` credential, and keep the workflows inactive until the external services are configured. Production deployments must add TLS, rate limiting, a real durable task store, GitHub App/OAuth callback handling, a queue, network egress policy, container resource limits, and audit retention.
