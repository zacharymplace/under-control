# Under Control Zero Lint Milestone

The project has reached a zero-lint-debt state for the tracked lint surface.

## Confirmed State

- `npm run check` passes.
- `npm run release:ready` passes.
- `npm run lint:debt` exits clean.
- `npm run lint:debt:baseline` matches the zero baseline.
- No `@typescript-eslint/no-explicit-any` findings remain.

## Operating Rule

Lint debt should not silently return.

Any future lint debt should be handled in one of three ways:

1. Fix it in the same narrow change if safe.
2. Isolate it in a dedicated lint cleanup branch.
3. Document it intentionally in `docs/qa/LINT_DEBT_BASELINE.md`.

Do not mix lint cleanup with gameplay, scoring, route, scenario, or release-gate changes unless the lint issue is directly caused by that same change.

## Current Release Readiness

The build gate remains:

    npm run check

Release readiness now verifies both the build gate and zero-lint guard:

    npm run release:ready

The lint baseline guard remains available directly through:

    npm run lint:debt
    npm run lint:debt:baseline
    npm run pr:cleanup-check
