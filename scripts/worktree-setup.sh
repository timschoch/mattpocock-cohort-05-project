#!/usr/bin/env bash
# Makes a fresh git worktree runnable: packages, .env, and a seeded data.db.
# Safe to run again; it only fills in what is missing.
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
main="$(git worktree list --porcelain | awk 'NR == 1 { sub(/^worktree /, ""); print }')"
cd "$root"

if [ ! -d node_modules ]; then
  npm ci
fi

if [ ! -e .env ] && [ "$main" != "$root" ] && [ -e "$main/.env" ]; then
  cp "$main/.env" .env
  echo "Copied .env from $main"
fi

if [ ! -e data.db ]; then
  npm run db:seed
fi
