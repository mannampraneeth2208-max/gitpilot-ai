# Free GitPilot setup

## Recommended choice

Use the self-hosted n8n Community Edition in `docker-compose.full.yml`. Do not depend on n8n Cloud. n8n documents that the Community Edition runs free without a license key and includes almost the complete feature set. It omits some multi-user and enterprise capabilities such as sharing, log streaming, SSO, environments, and external secrets.

This is suitable for a single operator running GitPilot for internal or personal use. n8n's Sustainable Use License is not an OSI open-source license and has restrictions on offering n8n itself as a commercial hosted product. GitPilot should use n8n as an internal orchestration dependency, not resell n8n Cloud or expose an n8n workflow-builder service.

## One-time human actions

These actions require the account owner or infrastructure owner. GitPilot cannot safely perform them by itself:

1. **Choose a machine.** Provide a Linux VPS, home server, or local computer that can stay online. Install Docker Engine and Docker Compose. The current Manus sandbox does not have Docker installed, so the full stack cannot be started permanently here.
2. **Create runtime secrets.** Copy `.env.full.example` to `.env` on that machine and replace every `replace-*` value. Keep `.env` outside GitHub. Required secrets include the PostgreSQL password, n8n encryption key, webhook secret, worker shared secret, GitHub credential, and Gemini credential.
3. **Connect GitHub.** The GitHub connector is already linked for this Manus session, but the Docker/n8n runtime needs its own GitHub App or fine-grained token. Grant only the repositories and permissions GitPilot needs: metadata read, contents read/write, issues read, pull requests read/write, and checks/actions read. Never grant organization administration, billing, secrets administration, or unrestricted account control.
4. **Connect Gemini.** The Google Gemini connector is enabled in Manus. For the self-hosted runtime, place the Gemini API key in the deployment secret store as `GEMINI_API_KEY`; never commit it or place it in browser JavaScript. Configure a verified Gemini model name and request limits.
5. **Configure Gmail only if notifications are wanted.** Use Gmail OAuth through the connector or a server-side OAuth credential. Never provide or store the Gmail password. Gmail is optional and is not needed for GitHub contributions.
6. **Initialize n8n.** Start the self-hosted n8n service, create the first owner account, import all 16 JSON workflows from `runtime/workflows/`, and create the PostgreSQL credential referenced by the workflows.
7. **Set webhook and network boundaries.** Put n8n and the API behind HTTPS, restrict the n8n editor to the operator, set a real webhook URL, and do not expose PostgreSQL or the worker directly to the public internet.
8. **Set contribution policy.** Define allowed repositories, languages, issue labels, maximum change size, forbidden areas, whether forks are allowed, and whether automatic PR creation is allowed. Keep `GITPILOT_APPROVAL_POLICY=autonomous` only if the account owner explicitly accepts automatic execution.
9. **Choose the first target.** Supply either a target repository/issue or permission for the Brain to discover public issues within the contribution policy. GitPilot must not guess a repository boundary from the word “GitHub.”

## What GitPilot can do after setup

After those human actions are complete, the Brain can discover repositories and issues within the configured scope, inspect repository history, form a plan, create a branch or fork when permitted, implement a bounded change, run tests, perform security review, run independent review, record evidence, and open a pull request when the configured policy allows it. It can send status notifications through Gmail if Gmail OAuth is configured.

The Brain cannot bypass GitHub permissions, accept a repository's contributor agreement, solve a CAPTCHA, complete an interactive OAuth consent screen, agree to paid infrastructure, recover a lost secret, or make a legal decision about a contribution license. Those remain human actions.

## Free alternatives

- **n8n Community Edition:** Best fit because the repository already contains n8n workflow JSON and the Compose file already self-hosts it. No workflow migration is required.
- **Activepieces Community Edition:** Free self-hosting is possible and the core is MIT-licensed, but all 16 workflows would need to be redesigned and re-tested. It is a migration option, not the fastest way to start this project.
- **Node-RED:** Free and open source, but it is a lower-level flow tool. Rebuilding GitPilot's planner, evidence gates, retries, and credential handling would require substantial custom code.

## Start command

On the machine with Docker:

```bash
cp .env.full.example .env
# edit .env; do not commit it
docker compose -f docker-compose.full.yml up -d --build
```

Then open n8n on port 5678, complete the owner setup, import the workflows, and verify the API health endpoint before enabling any autonomous contribution action.
