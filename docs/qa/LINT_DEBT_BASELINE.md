# Under Control Lint Debt Baseline

This baseline captures the current lint debt surface for visibility and staged cleanup planning.

It is not the release gate. The current release gate remains:

    npm run check

## Current Snapshot

| Metric | Count |
| --- | ---: |
| Total problems | 0 |
| Errors | 0 |
| Warnings | 0 |
| Lint exit code | 0 |

## Rule Counts

| Rule | Count |
| --- | ---: |

## Top Affected Files

| File | Issue Count |
| --- | ---: |

## Usage

Use this baseline to plan lint cleanup in small, scoped patches.

Recommended order:

1. UI-only unused variables.
2. Small app page type fixes.
3. Stable shared gameplay type cleanup where the domain shape is already clear.
4. React hook findings in playtest tooling.
5. Broader any replacement only after the stable types are clearer.

Do not combine broad lint cleanup with gameplay, scoring, route, scenario, or release-gate changes.
