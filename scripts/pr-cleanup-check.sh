#!/usr/bin/env bash
set -euo pipefail

echo "== Under Control PR Cleanup Check =="

echo
echo "== branch =="
git status --short --branch

echo
echo "== local diff =="
git diff --stat

echo
echo "== build gate =="
npm run check

echo
echo "== release readiness =="
npm run release:ready

echo
echo "== lint debt visibility =="
npm run lint:debt

echo
echo "== lint baseline check =="
npm run lint:debt:baseline

echo
echo "== lint cleanup guide =="
npm run lint:debt:guide

echo
echo "PASS | PR cleanup check complete"
