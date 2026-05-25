# Under Control Validation Contract

## Current Release Gate

The current reliable validation gate is:

```bash
npm run check
```

At this stage, `npm run check` intentionally maps to:

```bash
npm run build
```

This proves the playable app compiles, TypeScript passes through the Next.js production build, and all current routes generate successfully.

## Why Lint Is Not the Release Gate Yet

`npm run lint` currently exposes a large pre-existing lint debt surface, mostly:

- broad any usage in gameplay and UI prototype files
- unused variables from experimental systems
- React hook lint findings in playtest tooling
- historical prototype files that still compile but are not lint-clean

This debt is real, but it is not the same as release readiness for the current playable vertical slice.

Do not casually make `npm run lint` part of `npm run check` until the lint debt is intentionally reduced or baselined.

## Safe Agent Behavior

For normal patches:

  1. Run `npm run check`.
  2. If touching build/runtime behavior, run `npm run release:ready`.
  3. Run `npm run lint` only as an informational scan unless the task is explicitly about lint cleanup.
  4. Do not mix gameplay changes with broad lint cleanup.
  5. Do not rewrite many files just to satisfy lint without a narrow scope.

## Lint Debt Helper

Use this command for visibility only:

    npm run lint:debt

It runs `npm run lint`, preserves the full ESLint output in a temporary local report, prints a concise summary with top affected files by issue count and rule counts, and exits `0` so it cannot accidentally become the release gate.

Use this command only when you need the full raw ESLint output in the terminal:

    npm run lint:debt:verbose

## Recommended Lint Cleanup Strategy

Handle lint debt in staged passes:

  1. UI-only unused variables.
  2. Small, obvious app page types.
  3. Stable shared gameplay types.
  4. Prototype-only any replacement where the domain shape is clear.
  5. React hook lint findings in playtest tools.

Each pass should have its own branch, commit, and validation.

## Current Confidence

- Build gate: reliable.
- Release gate: reliable.
- Lint gate: not yet reliable as a release blocker.
- Gameplay semantics: should not be changed as part of lint cleanup.
