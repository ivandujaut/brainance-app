#!/bin/bash
# Claude Code SessionStart hook (ADR 0010). The work lives in scripts/dev/setup-sandbox.sh, which any
# tool or person can run; this wrapper only decides when to run it.
set -uo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  # Local machine: just make sure the versioned git hooks are active.
  node "$CLAUDE_PROJECT_DIR/scripts/checks/install-hooks.mjs"
  exit 0
fi

"$CLAUDE_PROJECT_DIR/scripts/dev/setup-sandbox.sh"

# Preinstalled Chromium for Playwright (docs/agentes/entorno.md).
if [ -x /opt/pw-browsers/chromium ] || [ -d /opt/pw-browsers/chromium ]; then
  [ -n "${CLAUDE_ENV_FILE:-}" ] && echo 'export PW_CHROMIUM_PATH=/opt/pw-browsers/chromium' >> "$CLAUDE_ENV_FILE"
fi
exit 0
