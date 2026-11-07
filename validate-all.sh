#!/usr/bin/env bash
set -euo pipefail
node --check server.js
(
  cd runtime
  python3 validate_workflows.py
)
node --check runtime/backend/server.js
node --check runtime/worker/server.js
printf 'GitPilot unified project validation passed.\n'
