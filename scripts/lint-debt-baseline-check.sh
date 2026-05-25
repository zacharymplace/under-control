#!/usr/bin/env bash
set -euo pipefail

BASELINE_FILE="docs/qa/LINT_DEBT_BASELINE.md"
REPORT_DIR="${TMPDIR:-/tmp}/under-control-lint-debt"
REPORT_FILE="$REPORT_DIR/eslint-output.txt"

mkdir -p "$REPORT_DIR"

echo "== Under Control lint debt baseline check =="
echo "Baseline: $BASELINE_FILE"
echo "Report: $REPORT_FILE"
echo

if [ ! -f "$BASELINE_FILE" ]; then
  echo "FAIL | missing lint debt baseline: $BASELINE_FILE"
  exit 1
fi

set +e
npm run lint >"$REPORT_FILE" 2>&1
lint_status=$?
set -e

problem_line="$(grep -E '^✖ [0-9]+ problems $begin:math:text$\[0\-9\]\+ errors\, \[0\-9\]\+ warnings$end:math:text$' "$REPORT_FILE" || true)"

if [ -z "$problem_line" ]; then
  if [ "$lint_status" -eq 0 ]; then
    actual_total=0
    actual_errors=0
    actual_warnings=0
  else
    echo "FAIL | could not parse ESLint problem summary"
    tail -n 60 "$REPORT_FILE" || true
    exit 1
  fi
else
  actual_total="$(echo "$problem_line" | sed -E 's/^✖ ([0-9]+) problems.*/\1/')"
  actual_errors="$(echo "$problem_line" | sed -E 's/^✖ [0-9]+ problems $begin:math:text$\(\[0\-9\]\+\) errors\, \(\[0\-9\]\+\) warnings$end:math:text$.*/\1/')"
  actual_warnings="$(echo "$problem_line" | sed -E 's/^✖ [0-9]+ problems $begin:math:text$\(\[0\-9\]\+\) errors\, \(\[0\-9\]\+\) warnings$end:math:text$.*/\2/')"
fi

baseline_total="$(grep -E '^\| Total problems \|' "$BASELINE_FILE" | awk -F'|' '{gsub(/ /,"",$3); print $3}')"
baseline_errors="$(grep -E '^\| Errors \|' "$BASELINE_FILE" | awk -F'|' '{gsub(/ /,"",$3); print $3}')"
baseline_warnings="$(grep -E '^\| Warnings \|' "$BASELINE_FILE" | awk -F'|' '{gsub(/ /,"",$3); print $3}')"
baseline_exit="$(grep -E '^\| Lint exit code \|' "$BASELINE_FILE" | awk -F'|' '{gsub(/ /,"",$3); print $3}')"

echo "Measured:"
echo "- total=$actual_total"
echo "- errors=$actual_errors"
echo "- warnings=$actual_warnings"
echo "- lint_exit=$lint_status"
echo
echo "Baseline:"
echo "- total=$baseline_total"
echo "- errors=$baseline_errors"
echo "- warnings=$baseline_warnings"
echo "- lint_exit=$baseline_exit"
echo

failed=0

if [ "$actual_total" != "$baseline_total" ]; then
  echo "FAIL | total problems mismatch"
  failed=1
fi

if [ "$actual_errors" != "$baseline_errors" ]; then
  echo "FAIL | error count mismatch"
  failed=1
fi

if [ "$actual_warnings" != "$baseline_warnings" ]; then
  echo "FAIL | warning count mismatch"
  failed=1
fi

if [ "$lint_status" != "$baseline_exit" ]; then
  echo "FAIL | lint exit code mismatch"
  failed=1
fi

if [ "$failed" -ne 0 ]; then
  echo
  echo "Lint debt baseline drift detected."
  echo "Run npm run lint:debt, then update $BASELINE_FILE intentionally."
  exit 1
fi

echo "PASS | lint debt baseline matches current measured totals"
exit 0
