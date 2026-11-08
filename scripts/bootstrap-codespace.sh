#!/usr/bin/env bash
set -euo pipefail

: "${GEMINI_API_KEY:?Set GEMINI_API_KEY as a Codespaces secret before running this script}"
: "${OPENROUTER_API_KEY:?Set OPENROUTER_API_KEY as a Codespaces secret before running this script}"
GITHUB_RUNTIME_TOKEN="${GITHUB_RUNTIME_TOKEN:-$(gh auth token 2>/dev/null || true)}"
: "${GITHUB_RUNTIME_TOKEN:?Sign in to GitHub CLI in Codespaces or set GITHUB_RUNTIME_TOKEN}"

random_secret() { openssl rand -hex 32; }

cat > .env <<EOF
POSTGRES_DB=gitpilot
POSTGRES_USER=gitpilot
POSTGRES_PASSWORD=$(random_secret)
N8N_ENCRYPTION_KEY=$(random_secret)
GITHUB_TOKEN=${GITHUB_RUNTIME_TOKEN}
MODEL_ROUTER_URL=https://openrouter.ai/api/v1/chat/completions
MODEL_ROUTER_TOKEN=${OPENROUTER_API_KEY}
GITPILOT_MODEL=openai/gpt-4o-mini
GEMINI_API_KEY=${GEMINI_API_KEY}
GITPILOT_WEBHOOK_SECRET=$(random_secret)
WORKER_SHARED_SECRET=$(random_secret)
GITPILOT_APPROVAL_POLICY=autonomous
GMAIL_NOTIFICATION_MODE=disabled
GITPILOT_API_BASE=http://api:8080
EOF
chmod 600 .env
printf 'Private .env created. Starting the free self-hosted stack...\n'
docker compose -f docker-compose.full.yml up -d --build
printf 'Stack started. Open the forwarded n8n port, create the owner account, and import runtime/workflows/*.json.\n'
