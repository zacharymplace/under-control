# Under Control Lint Debt Baseline

This baseline captures the current lint debt surface for visibility and staged cleanup planning.

It is not the release gate. The build gate remains:

    npm run check

Release readiness verifies the build gate and this zero-lint baseline:

    npm run release:ready

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

This baseline now represents a zero-lint-debt state.

Use it as a regression guard:

1. `npm run lint:debt` should remain clean.
2. `npm run lint:debt:baseline` should continue matching this zero baseline.
3. New lint debt should be treated as intentional only when documented and isolated.
4. Do not reintroduce broad lint cleanup into gameplay, scoring, route, scenario, or release-gate changes.
5. Keep future lint-related changes small, reviewable, and separate from feature work.

The build gate remains:

    npm run check

Release readiness verifies the build gate and this zero-lint baseline:

    npm run release:ready
