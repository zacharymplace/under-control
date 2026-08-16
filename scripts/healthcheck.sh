#!/usr/bin/env bash
set -euo pipefail

echo "## Repo"
pwd

echo
echo "## Git"
git status --short --branch
git remote -v

echo
echo "## Runtime"
node -v
npm -v

echo
echo "## Checks"
npm run build
