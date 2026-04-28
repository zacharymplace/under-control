#!/usr/bin/env bash
set -euo pipefail

MSG="${1:-Update project}"

echo "Checking status..."
git status --short

echo "Running build check..."
rm -rf .next
npm run dev
