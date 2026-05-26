# Under Control Claude Instructions

## Project Role

Under Control is a playable systems-arena prototype. Treat this repo as a product/game prototype, not a generic Next.js sandbox.

## Current State

- Branch: playable-v0.1-systems-arena
- Zero lint debt is locked.
- `npm run release:ready` verifies:
  - build
  - lint debt
  - lint baseline
- Zero-lint checkpoint tag:
  - lint-zero-20260525

## Core Rule

Do not change gameplay semantics unless explicitly asked.

For cleanup, typing, docs, and refactors:
- preserve scoring behavior
- preserve route behavior
- preserve scenario behavior
- preserve UI copy unless asked
- preserve release gate semantics unless asked

## Validation Commands

Before proposing completion, run:

    npm run release:ready

For PR cleanup branches, also run:

    npm run pr:cleanup-check

## Branching

Use narrow branches.

Good branch examples:
- gameplay/playable-v01-feel-pass
- ui/decision-feedback-clarity
- docs/update-agent-instructions
- refactor/extract-actionbar-types

Bad branch examples:
- big-cleanup
- refactor-everything
- improve-game

## Commit Style

Prefer small commits with direct names:

- Type ActionBar state
- Improve early-turn feedback copy
- Add playable v0.1 feel notes
- Extract advisor display types

## Do Not

- Do not reintroduce `any`.
- Do not weaken `release:ready`.
- Do not mix gameplay changes with lint cleanup.
- Do not silently change scoring constants.
- Do not rewrite large files unless asked.
- Do not convert the project into a generic framework demo.

## Best Next Work

The next useful branch should be gameplay-facing:

    gameplay/playable-v01-feel-pass

Primary target:
- improve first 3–5 turns
- make action consequences clearer
- improve feedback timing
- preserve current systems architecture
