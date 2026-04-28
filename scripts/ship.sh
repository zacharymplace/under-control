#!/usr/bin/env bash
set -euo pipefail

MSG="${1:-Update}"

echo "---- STATUS ----"
git status --short

echo "---- DEV CHECK ----"
rm -rf .next

# run dev in background briefly to catch errors
npm run dev > /tmp/next-dev.log 2>&1 &
PID=$!
sleep 2

if grep -q "Error" /tmp/next-dev.log; then
  echo "Build error detected:"
  cat /tmp/next-dev.log
  kill $PID
  exit 1
fi

kill $PID

echo "---- COMMIT ----"
git add .
git commit -m "$MSG" || echo "Nothing to commit"

echo "---- PUSH ----"
git push

echo "---- DONE ----"
