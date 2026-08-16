#!/usr/bin/env bash
set -euo pipefail

echo "== Under Control lint debt refresh guide =="
echo
echo "This command does not edit files."
echo "It shows the safe sequence for reviewing or refreshing the lint debt baseline."
echo

echo "1. Confirm the build gate:"
echo "   npm run check"
echo

echo "2. Confirm release readiness:"
echo "   npm run release:ready"
echo

echo "3. Generate the current lint debt summary:"
echo "   npm run lint:debt"
echo

echo "4. Compare current lint output to the documented baseline:"
echo "   npm run lint:debt:baseline"
echo

echo "5. If the baseline check fails intentionally, update:"
echo "   docs/qa/LINT_DEBT_BASELINE.md"
echo

echo "Guardrails:"
echo "- Do not make lint cleanup part of npm run check yet."
echo "- Do not mix lint cleanup with gameplay, scoring, route, scenario, or release-gate changes."
echo "- Prefer narrow cleanup branches by file group or rule type."
