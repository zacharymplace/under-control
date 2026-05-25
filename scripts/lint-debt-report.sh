#!/usr/bin/env bash
set -euo pipefail

echo "== Under Control lint debt report =="
echo "This command is informational. It is not the release gate yet."
echo

set +e
npm run lint
status=$?
set -e

echo
echo "== lint debt report exit code =="
echo "$status"

if [ "$status" -eq 0 ]; then
  echo "PASS | lint is currently clean"
else
  echo "INFO | lint debt present; see docs/qa/VALIDATION_CONTRACT.md"
fi

exit 0
