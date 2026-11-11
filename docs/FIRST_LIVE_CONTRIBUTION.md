# First live contribution

This change records the first operator-facing contribution for GitPilot itself. The Control Room is the same-origin dashboard at port `3000`; the runtime API gateway is at port `8080`; n8n is at port `5678`.

The dashboard now reads pull-request activity from the GitHub repository configured by `GITHUB_REPO` through its server-side `/api/completed` adapter, and uses the runtime gateway for execution events. Provider secrets remain write-only in the dashboard and belong in Codespaces secrets or another runtime secret store, never in this file.

## Verification trace

- Repository: `mannampraneeth2208-max/gitpilot-ai`
- Branch: `gitpilot/first-live-contribution`
- Scope: documentation only
- Expected checks: Markdown review and repository status check
- Merge: intentionally not performed by GitPilot
