# GitPilot phone-only setup

This runbook assumes the operator has only an Android/iPhone and uses a mobile browser. The repository-side work is already complete. The remaining steps are account authorization, secret entry, and choosing where the runtime stays online.

## Important hosting choice

A phone cannot reliably host PostgreSQL, n8n, the API gateway, and the worker continuously in the background. Android and iOS may suspend background processes, terminate containers, restrict network listeners, or stop work when the app is closed.

There are two practical choices:

### Option A: GitHub Codespaces for free, temporary runs

Codespaces is usable from a mobile browser and provides a cloud development environment. Personal GitHub accounts include a monthly free quota, but Codespaces stop after inactivity and are not an always-on production server. GitHub documents the current free quota and billing behavior here: https://docs.github.com/billing/managing-billing-for-github-codespaces/about-billing-for-github-codespaces.

Use this for setup, testing, and manually starting a run:

1. Open `https://github.com/mannampraneeth2208-max/gitpilot-ai` in a phone browser.
2. Tap **Code**, open **Codespaces**, and create a codespace from `main`.
3. Wait for the repository's Docker-enabled Codespaces configuration to finish building.
4. Open the browser terminal.
5. Verify the project:

   ```bash
   ./validate-all.sh
   npm --prefix runtime test
   ```

6. Do not commit `.env`. If you start services in the codespace, enter secrets only into the codespace environment or a local untracked `.env` file.
7. Stop the codespace when finished. Do not use it as the permanent n8n host.

### Option B: Always-on cloud host

For 24/7 operation, create a small Linux VM or managed container host from a phone browser. The human owner must create the account, accept terms, choose a region, and handle any payment or identity verification. After the host exists, the repository can be deployed with Docker Compose:

```bash
git clone https://github.com/mannampraneeth2208-max/gitpilot-ai.git
cd gitpilot-ai
cp .env.full.example .env
# fill .env without committing it
docker compose -f docker-compose.full.yml up -d --build
```

The host must provide HTTPS, persistent storage, backups, a firewall, and a way to restart services after a reboot. Do not expose PostgreSQL or the worker directly to the internet.

## Phone-only secret setup

Never put secrets in GitHub source files. In the GitHub mobile website, use **Settings → Secrets and variables → Actions** for secrets needed by GitHub Actions. For a Docker host, put secrets in the host's secret manager or untracked `.env` file.

Use these names when the selected runtime needs them:

- `GEMINI_API_KEY`: a newly rotated Gemini key. The key previously pasted in chat should be revoked and replaced.
- `GITHUB_TOKEN` or `GITHUB_PAT`: a GitHub App or fine-grained token for the runtime. The built-in GitHub Actions token only covers the repository where the action runs.
- `N8N_ENCRYPTION_KEY`: a long random value that must remain stable for the n8n installation.
- `POSTGRES_PASSWORD`: a strong database password.
- `GITPILOT_WEBHOOK_SECRET`: a random API/webhook signing secret.
- `WORKER_SHARED_SECRET`: a random API/worker signing secret.
- `GITPILOT_APPROVAL_POLICY`: use `autonomous` only if automatic PR creation is intended; use `human_gate` otherwise.

Do not add a Gmail password. Gmail notifications use OAuth through the Gmail connector.

## Connector actions

GitHub, Gmail, and Google Gemini are connected in Manus. The n8n connector is not needed for the free self-hosted route. Self-hosted n8n is started by Docker Compose and configured in its own browser editor.

The Manus connector authorization and the Docker runtime credentials are separate. A connector being linked in Manus does not automatically place its hidden credential inside a GitHub Actions runner or Docker container. The runtime needs its own server-side credential entry.

## n8n setup on the phone

After Docker Compose is running on the always-on host:

1. Open the host's HTTPS n8n URL in the phone browser.
2. Create the n8n owner account.
3. Import the JSON files in `runtime/workflows/`.
4. Create the PostgreSQL credential named `GitPilot PostgreSQL`.
5. Add the server-side GitHub and Gemini credentials.
6. Confirm that the API health endpoint responds.
7. Run one read-only repository discovery task first.
8. Review its evidence, plan, tests, and security result.
9. Enable autonomous execution only after the read-only run succeeds.

## What the Brain can decide

The agents can define a contribution scope and select an initial issue inside the permitted boundary. A safe default is:

- public repositories only;
- documentation, tests, small bug fixes, and maintenance;
- no authentication, payment, cryptography, secrets, or production deployment changes;
- maximum 500 changed lines;
- no direct protected-branch writes;
- pull requests only after tests, security review, and independent review.

The Brain cannot accept a legal agreement, complete a CAPTCHA, grant a GitHub permission, choose a paid hosting plan, or recover a lost secret.

## Network and notification behavior

If GitPilot runs on a cloud host, it does not depend on the phone's Wi-Fi. The host continues while the phone is offline. Gmail notifications arrive when the phone reconnects.

If the host itself loses internet, GitPilot should pause and retry after connectivity returns. No notification can be delivered to the phone while every network path is offline.

## Minimum human checklist

1. Rotate the Gemini key exposed in chat.
2. Choose Codespaces for temporary use or a cloud VM for 24/7 use.
3. Create the host account and complete any identity/payment step.
4. Add runtime secrets privately.
5. Grant the required GitHub repository permissions.
6. Complete the first n8n owner and credential setup.
7. Choose the allowed repository boundary.
8. Choose autonomous mode or human-gated mode.
9. Start with one read-only discovery run.
10. Enable contribution execution after the read-only run passes.
