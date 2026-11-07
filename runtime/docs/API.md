# GitPilot API mapping

Configure n8n webhook base URL and expose it only behind an authenticated backend. The browser must never receive n8n management credentials.

| Application route | Workflow webhook |
|---|---|
| POST `/api/v1/gitpilot/analyze` | `01_GITPILOT_CENTRAL_BRAIN` `/webhook/api/v1/gitpilot/analyze` |
| POST `/api/v1/gitpilot/discover` | central `/webhook/api/v1/gitpilot/discover` |
| POST `/api/v1/gitpilot/plan` | central `/webhook/api/v1/gitpilot/plan` |
| POST `/api/v1/gitpilot/execute` | central `/webhook/api/v1/gitpilot/execute` |
| POST `/api/v1/gitpilot/approve` | central `/webhook/api/v1/gitpilot/approve` |
| POST `/api/v1/gitpilot/review` | central `/webhook/api/v1/gitpilot/review` |

The GET task/repository/opportunity endpoints should be implemented by the application backend over PostgreSQL; do not expose arbitrary SQL through n8n. Every request must carry `userId`, an idempotency key, and a backend-verified signature.
