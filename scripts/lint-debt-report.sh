#!/usr/bin/env bash
set -euo pipefail

REPORT_DIR="${TMPDIR:-/tmp}/under-control-lint-debt"
REPORT_FILE="$REPORT_DIR/eslint-output.txt"

mkdir -p "$REPORT_DIR"

echo "== Under Control lint debt report =="
echo "This command is informational. It is not the release gate yet."
echo "Report: $REPORT_FILE"
echo

set +e
npm run lint >"$REPORT_FILE" 2>&1
status=$?
set -e

cat "$REPORT_FILE"

echo
echo "== lint debt report exit code =="
echo "$status"

echo
echo "== lint debt summary =="
if [ "$status" -eq 0 ]; then
  echo "PASS | lint is currently clean"
else
  echo "INFO | lint debt present; see docs/qa/VALIDATION_CONTRACT.md"
  echo
  echo "Top affected files by issue count:"
  awk -v root="$(pwd)/" '
    /^\/.*\.(ts|tsx)$/ {
      file=$0
      sub(root, "", file)
      next
    }

    /^[[:space:]]+[0-9]+:[0-9]+[[:space:]]+(error|warning)[[:space:]]+/ {
      if (file != "") {
        counts[file]++
      }
    }

    END {
      for (file in counts) {
        printf "%5d %s\n", counts[file], file
      }
    }
  ' "$REPORT_FILE" \
    | sort -nr \
    | sed -n '1,20p' || true

  echo
  echo "Rule counts:"
  grep -E '(@typescript-eslint|react-hooks)/[a-zA-Z0-9-]+' "$REPORT_FILE" \
    | sed -E 's/.* ((@typescript-eslint|react-hooks)\/[a-zA-Z0-9-]+).*/\1/' \
    | sort \
    | uniq -c \
    | sort -nr || true
fi

exit 0
