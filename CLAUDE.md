@AGENTS.md

# Claude Operating Rules

## Project Purpose

Under Control is a systems-arena game prototype about pressure, advisor conflict, trust, collapse, recovery, and decision quality under constraint.

Treat this repo as a playable game system with sensitive tuning logic, not a generic Next.js sandbox.

## Default Work Mode

Claude should act as a repo-native implementation agent.

Expected loop:

1. Read CLAUDE.md, AGENTS.md, README.md, package.json, and relevant docs before editing.
2. Inspect relevant files before editing.
3. Create the smallest useful patch.
4. Avoid unrelated cleanup.
5. Run validation.
6. Summarize changed files, validation results, risks, and next steps.

## Do Not Change Without Explicit Approval

- Core game loop
- Game state shape
- Reducer behavior
- Advisor/persona logic
- Scoring or tuning assumptions
- Collapse, pressure, trust, recovery, or lock-in mechanics
- Scenario semantics
- Telemetry/playtest reporting
- Public route structure
- Visual identity or UX hierarchy

## Protected Areas

Be especially careful with:

- src/game/types.ts
- src/game/state.ts
- src/game/v01/reducer.ts
- src/game/v01/initialState.ts
- src/game/v01/scenarios.ts
- src/game/scenarios.ts
- src/game/tuning.ts
- src/game/actionScoring.ts
- src/game/tickEngine.ts
- src/game/runAnalytics.ts
- src/game/telemetry.ts
- src/ui/GameScreen.tsx
- src/ui/UnderControlV01.tsx
- src/ui/UnderControlV01DecisionPanel.tsx
- src/app/playable-v01/page.tsx
- src/app/playtest-runs/page.tsx
- docs
- package.json
- next.config.ts

Changes to these areas should be small, justified, and validated.

## Validation Commands

Current release validation:

    npm run release:ready

Current repo check:

    npm run check

Agent preflight:

    npm run agent:preflight

Important: npm run lint is currently a strict audit with many pre-existing violations. Do not treat lint as the release gate until a dedicated lint cleanup project is completed.

## Commit Rules

- Use a branch for every change.
- Keep commits small.
- Do not push without explicit instruction.
- Do not rewrite Git history unless explicitly instructed.
- Do not mix unrelated fixes into the same patch.
- Leave the working tree clean after a completed task when possible.

## Product Judgment

When uncertain, prefer:

- playable clarity over hidden complexity
- state/reducer ownership over UI-owned rules
- pressure readability over decorative systems
- explicit playtest evidence over tuning guesses
- small validation improvements over broad rewrites
- boring maintainable code over impressive complexity
