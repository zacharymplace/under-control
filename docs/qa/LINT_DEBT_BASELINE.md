# Under Control Lint Debt Baseline

This baseline captures the current lint debt surface for visibility and staged cleanup planning.

It is not the release gate. The current release gate remains:

    npm run check

## Current Snapshot

| Metric | Count |
| --- | ---: |
| Total problems | 252 |
| Errors | 247 |
| Warnings | 5 |
| Lint exit code | 1 |

## Rule Counts

| Rule | Count |
| --- | ---: |
| @typescript-eslint/no-explicit-any | 247 |
| @typescript-eslint/no-unused-vars | 5 |

## Top Affected Files

| File | Issue Count |
| --- | ---: |
| src/game/actionScoring.ts | 15 |
| src/ui/ActionBar.tsx | 15 |
| src/ui/DecisionTimeline.tsx | 12 |
| src/game/personaEngine.ts | 8 |
| src/game/runReplay.ts | 8 |
| src/game/counterfactual.ts | 6 |
| src/game/advisorInterruption.ts | 5 |
| src/game/outcome.ts | 5 |
| src/game/personaConfidence.ts | 5 |
| src/game/runLegibility.ts | 5 |
| src/game/advisorCredibility.ts | 4 |
| src/game/irreversibility.ts | 4 |
| src/game/runArc.ts | 4 |
| src/ui/GameScreen.tsx | 4 |
| src/game/advisorCertainty.ts | 3 |
| src/game/commitment.ts | 3 |
| src/game/needNeglect.ts | 3 |
| src/game/playerNarrative.ts | 3 |
| src/game/telemetry.ts | 3 |
| src/game/timelineCompression.ts | 3 |
| src/game/trajectoryRisk.ts | 3 |
| src/ui/Counterfactual.tsx | 3 |
| src/ui/RunReplay.tsx | 3 |
| src/ui/RunReport.tsx | 3 |
| src/game/actionFeedback.ts | 2 |

## Usage

Use this baseline to plan lint cleanup in small, scoped patches.

Recommended order:

1. UI-only unused variables.
2. Small app page type fixes.
3. Stable shared gameplay type cleanup where the domain shape is already clear.
4. React hook findings in playtest tooling.
5. Broader any replacement only after the stable types are clearer.

Do not combine broad lint cleanup with gameplay, scoring, route, scenario, or release-gate changes.
