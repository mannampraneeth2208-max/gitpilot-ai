# Workflow map

Central Brain receives application requests, persists task state, and enforces approval. Discovery and intelligence workflows read GitHub through HTTP Request nodes using `GITHUB_TOKEN`. Agent workflows call the configurable model router and persist evidence. Implementation/testing workflows must call the isolated worker service. PR manager is approval-gated. Monitoring, memory, recovery, and notifications close the loop.

All workflows are inactive on import and use only built-in n8n nodes: Webhook, Code, HTTP Request, Postgres, and Respond to Webhook.
