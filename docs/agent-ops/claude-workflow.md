# Claude Workflow

## Purpose

This document defines how Claude should be used inside Under Control.

Claude is best used for narrow implementation, build repair, documentation parity, validation scaffolding, and small UI improvements that preserve game-state ownership.

Game feel, advisor logic, scoring, pressure, collapse, trust, and recovery tuning require explicit approval before edits.

## Good Claude Tasks

- Fix a failing build.
- Add validation around existing behavior.
- Improve docs to match implemented behavior.
- Add small UI affordances that read existing state.
- Refactor narrow duplicated display code.
- Add playtest reporting without changing tuning.
- Make existing state transitions easier to inspect.

## Bad Claude Tasks

- Rewrite the reducer broadly.
- Move game rules into React UI.
- Tune scoring or pressure without approval.
- Change advisor/persona semantics casually.
- Change collapse or recovery mechanics casually.
- Add dependencies casually.
- Do broad lint cleanup mixed with feature work.

## Standard Prompt

Read CLAUDE.md, AGENTS.md, README.md, package.json, and relevant docs first.

Create or stay on a task branch.

Implement the smallest useful version of the requested change.

Do not change core game loop, reducer behavior, advisor/persona logic, scoring, pressure, collapse, recovery, telemetry semantics, or unrelated files.

Run:

    npm run agent:preflight
    npm run release:ready

Summarize:

- files changed
- validation results
- risks
- next recommended patch

Do not push unless explicitly asked.
