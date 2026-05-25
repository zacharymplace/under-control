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

diagnostic_pattern = re.compile(r"^\s+[0-9]+:[0-9]+\s+(error|warning)\s+", re.MULTILINE)
diagnostics = diagnostic_pattern.findall(report)

actual_errors = sum(1 for item in diagnostics if item == "error")
actual_warnings = sum(1 for item in diagnostics if item == "warning")
actual_total = actual_errors + actual_warnings

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
    stripped = line.strip()

    if stripped == "## Rule Counts":
        in_rules = True
        continue

    if in_rules and stripped.startswith("## "):
        break

    if in_rules:
        match = re.match(r"\|\s*([^|]+?)\s*\|\s*([0-9]+)\s*\|", line)
        if match:
            rule = match.group(1).strip()
            if rule not in {"Rule", "---"}:
                baseline_rules[rule] = int(match.group(2))

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

baseline_top_files = {}
in_top_files = False

for line in baseline.splitlines():
    stripped = line.strip()

    if stripped == "## Top Affected Files":
        in_top_files = True
        continue

    if in_top_files and stripped.startswith("## "):
        break

    if in_top_files:
        match = re.match(r"\|\s*([^|]+?)\s*\|\s*([0-9]+)\s*\|", line)
        if not match:
            continue

        file_name = match.group(1).strip()
        if file_name in {"File", "---"}:
            continue

        baseline_top_files[file_name] = int(match.group(2))

actual_file_counts = {}
current_file = None
root = str(Path.cwd()) + "/"

for line in report.splitlines():
    if re.match(r"^/.*\.(ts|tsx)$", line):
        current_file = line.replace(root, "")
        continue

    if re.match(r"^\s+[0-9]+:[0-9]+\s+(error|warning)\s+", line):
        if current_file:
            actual_file_counts[current_file] = actual_file_counts.get(current_file, 0) + 1

for file_name, expected in sorted(baseline_top_files.items()):
    actual = actual_file_counts.get(file_name, 0)
    if expected == actual:
        print(f"PASS | {file_name} | {actual}")
    else:
        print(f"FAIL | {file_name} | expected={expected} actual={actual}")
        failed = True

if failed:
    print()
    print("Lint debt baseline drift detected.")
    print(f"Run npm run lint:debt, then update {baseline_file} intentionally.")
    sys.exit(1)

print()
print("PASS | lint debt baseline matches current ESLint output")
PY
