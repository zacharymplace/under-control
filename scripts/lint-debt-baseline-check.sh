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

set +e
npm run lint >"$REPORT_FILE" 2>&1
lint_status=$?
set -e

BASELINE_FILE="$BASELINE_FILE" REPORT_FILE="$REPORT_FILE" LINT_STATUS="$lint_status" python3 - <<'PY'
from pathlib import Path
import os
import re
import sys

baseline_file = Path(os.environ["BASELINE_FILE"])
report_file = Path(os.environ["REPORT_FILE"])
lint_status = int(os.environ["LINT_STATUS"])

baseline = baseline_file.read_text()
report = report_file.read_text()

def fail(message: str) -> None:
    print(f"FAIL | {message}")
    print()
    print("Last 60 lines of ESLint report:")
    print("\n".join(report.splitlines()[-60:]))
    sys.exit(1)

def parse_metric(name: str) -> int:
    pattern = rf"\|\s*{re.escape(name)}\s*\|\s*([0-9]+)\s*\|"
    match = re.search(pattern, baseline)
    if not match:
        fail(f"could not parse baseline metric: {name}")
    return int(match.group(1))

summary_match = re.search(
    r"([0-9]+)\s+problems?\s+$begin:math:text$\(\[0\-9\]\+\)\\s\+errors\?\,\\s\+\(\[0\-9\]\+\)\\s\+warnings\?$end:math:text$",
    report,
)
if not summary_match:
    fail("could not parse ESLint problem summary")

actual_total = int(summary_match.group(1))
actual_errors = int(summary_match.group(2))
actual_warnings = int(summary_match.group(3))

expected_total = parse_metric("Total problems")
expected_errors = parse_metric("Errors")
expected_warnings = parse_metric("Warnings")
expected_exit = parse_metric("Lint exit code")

checks = [
    ("total problems", expected_total, actual_total),
    ("errors", expected_errors, actual_errors),
    ("warnings", expected_warnings, actual_warnings),
    ("lint exit code", expected_exit, lint_status),
]

failed = False
for label, expected, actual in checks:
    if expected == actual:
        print(f"PASS | {label} | {actual}")
    else:
        print(f"FAIL | {label} | expected={expected} actual={actual}")
        failed = True

baseline_rules = {}
in_rules = False
for line in baseline.splitlines():
    if line.strip() == "## Rule Counts":
        in_rules = True
        continue
    if in_rules and line.startswith("## "):
        break
    if in_rules:
        match = re.match(r"\|\s*([^|]+?)\s*\|\s*([0-9]+)\s*\|", line)
        if match and match.group(1).strip() not in {"Rule", "---"}:
            baseline_rules[match.group(1).strip()] = int(match.group(2))

actual_rules = {}
for match in re.finditer(r"((?:@typescript-eslint|react-hooks)/[A-Za-z0-9-]+)", report):
    rule = match.group(1)
    actual_rules[rule] = actual_rules.get(rule, 0) + 1

for rule, expected in sorted(baseline_rules.items()):
    actual = actual_rules.get(rule, 0)
    if expected == actual:
        print(f"PASS | {rule} | {actual}")
    else:
        print(f"FAIL | {rule} | expected={expected} actual={actual}")
        failed = True

undocumented = sorted(set(actual_rules) - set(baseline_rules))
if undocumented:
    print("FAIL | undocumented rules present | " + ", ".join(undocumented))
    failed = True

if failed:
    sys.exit(1)

print()
print("PASS | lint debt baseline matches current ESLint output")
PY
