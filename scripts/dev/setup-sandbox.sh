#!/bin/bash
# Prepares a sandbox or cloud container to work on the repo (ADR 0010): dependencies, Prisma client,
# local Postgres with the test and E2E databases migrated, and the versioned git hooks.
# Idempotent and quick when everything is already in place. Any tool, or a person, can run it.
set -uo pipefail

cd "$(dirname "$0")/../.."

PG_URL="postgresql://postgres:postgres@localhost:5432"
say() { echo "setup: $*"; }

# Dependencies. `npm install` (not `npm ci`) so a cached node_modules is reused.
# It also runs `prisma generate` (postinstall) and installs the git hooks (prepare).
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  say "instalando dependencias"
  npm install --no-audit --no-fund --loglevel=error >/dev/null 2>&1 || say "npm install falló: corré npm install para ver el error"
else
  # The schema may have changed on another branch: a stale client breaks the typecheck.
  npx --no-install prisma generate >/dev/null 2>&1 || say "prisma generate falló"
  node scripts/checks/install-hooks.mjs
fi

# Local Postgres, when the container has one.
if command -v pg_isready >/dev/null 2>&1; then
  if ! pg_isready -q -h localhost -p 5432; then
    service postgresql start >/dev/null 2>&1 || true
    for _ in 1 2 3 4 5 6 7 8 9 10; do pg_isready -q -h localhost -p 5432 && break; sleep 1; done
  fi
  if pg_isready -q -h localhost -p 5432; then
    for db in brainance_test brainance_e2e; do
      if ! psql "$PG_URL/postgres" -tAc "SELECT 1 FROM pg_database WHERE datname = '$db'" 2>/dev/null | grep -q 1; then
        psql "$PG_URL/postgres" -qc "CREATE DATABASE $db" >/dev/null 2>&1 || say "no se pudo crear $db"
      fi
      DATABASE_URL="$PG_URL/$db" DIRECT_URL="$PG_URL/$db" npx --no-install prisma migrate deploy >/dev/null 2>&1 \
        || say "no se pudieron aplicar las migraciones a $db"
    done
    say "Postgres listo: brainance_test y brainance_e2e migradas ($PG_URL/<base>)"
  else
    say "Postgres no arrancó: los tests de integración y los E2E no van a andar"
  fi
fi
