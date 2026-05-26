# Under Control Lint Debt Baseline

This baseline captures the current lint debt surface for visibility and staged cleanup planning.

It is not the release gate. The current release gate remains:

    npm run check

## Current Snapshot

| Metric | Count |
| --- | ---: |
| Total problems | 26 |
| Errors | 26 |
| Warnings | 0 |
| Lint exit code | 1 |

## Rule Counts

| Rule | Count |
| --- | ---: |
| @typescript-eslint/no-explicit-any | 26 |

## Top Affected Files

| File | Issue Count |
| --- | ---: |
| src/game/actionScoring.ts | 15 |
| src/ui/ActionBar.tsx | 11 |

## Usage

Use this baseline to plan lint cleanup in small, scoped patches.

Recommended order:

1. UI-only unused variables.
2. Small app page type fixes.
3. Stable shared gameplay type cleanup where the domain shape is already clear.
4. React hook findings in playtest tooling.
5. Broader any replacement only after the stable types are clearer.

Do not combine broad lint cleanup with gameplay, scoring, route, scenario, or release-gate changes.
