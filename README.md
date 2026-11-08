# GitPilot Control Room

GitPilot is delivered here as one repository: the `runtime/` directory contains the validated 16-workflow n8n package, PostgreSQL schema, API gateway, isolated worker, agent prompts, and runtime documentation. The root application is the Control Room dashboard for completed contributions, active work, approval gates, repositories, agents, events, and provider settings.

## Free self-hosted path

Use the free self-hosted n8n Community Edition in `docker-compose.full.yml`; do not use n8n Cloud for this project. See [`docs/SETUP_FREE.md`](docs/SETUP_FREE.md) for the human-required steps, connector boundaries, and deployment checklist.

## Start the complete stack

```bash
cp .env.full.example .env
# Replace every required value; do not put Gmail passwords in this file.
npm start
# For the full stack, use Docker:
docker compose -f docker-compose.full.yml up -d --build
```

The dashboard listens on port 3000, the API gateway on 8080, and n8n on 5678. Import the workflow JSON files from `runtime/workflows/` into n8n and create a PostgreSQL credential named `GitPilot PostgreSQL`. Keep workflows inactive until GitHub, model-provider, worker, and approval settings are verified.

## Dashboard features

The Control Room shows active and completed contributions, evidence-linked task states, the human approval queue, repository/index status, specialist-agent activity, event history, and provider health. The Settings view supports adding and rotating provider keys through server-side write-only endpoints. Raw secrets are never returned to the browser. Gmail is optional for notifications and the app does not accept or search for Gmail passwords or mailbox credentials.

## Production boundary

Before public deployment, add authenticated operator sessions and roles, durable secret storage, a durable task store, TLS, rate limiting, a real GitHub App/OAuth installation flow, model selection validation, queue/retry infrastructure, and end-to-end acceptance evidence. The Preview uses a safe demo adapter when `GITPILOT_API_BASE` is absent; set it to the real gateway for live operation.
