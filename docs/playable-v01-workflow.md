# Under Control — Playable v0.1 Workflow

## Routes

| Route | Purpose |
|---|---|
| `/` | Launcher for the playable arena and telemetry lab |
| `/playable-v01` | Playable systems arena |
| `/playtest-runs` | Telemetry import, review, tuning, and export lab |

---

## 1. Run locally

```bash
cd ~/dev/under-control
npm run build
npm run dev -- -p 3000
```

Open:

```text
http://localhost:3000
```

---

## 2. Play a run

Open:

```text
http://localhost:3000/playable-v01
```

Recommended flow:

  1. Choose a scenario
  2. Start the scenario
  3. Select a target node
  4. Choose an action:
    - `OBSERVE`
    - `REROUTE`
    - `STABILIZE`
  5. Read the decision preview
  6. Commit the action
  7. Advance cycles until win/loss
  8. Export the run JSON at the run-end summary

The exported run JSON is the unit of telemetry for the review lab.

---

## 3. Review telemetry

Open:

```text
http://localhost:3000/playtest-runs
```

Use the lab to:

- import individual run JSON files
- persist imported runs locally in browser storage
- filter by scenario, status, and confidence
- use review presets
- inspect dataset health
- compare scenarios
- review tuning recommendations
- inspect trend rows
- annotate individual runs
- delete duplicate or bad improts
- bulk delete low-confidence zero-action runs
- export review JSON
- export run CSV
- export scenario CSV

---

## 4. Import rules

The lab accepts only inidivual run JSON exports from:

```text
/playable-v01
```

It intentionally rejects review JSON exports from:

```text
/playtest-runs
```

This prevents review summaries from being imported as fake runs.

---

## 5 Confidence rules

A run is considered low-confidence when:

```text
actions.total === 0
```

Low-confidence runs are still visible, but they are flagged and should not drive balance decisions.

Use:

```text

DELETE LOW-CONFIDENCE
```

to remove zero-action runs while preserving valid committed-action runs.

---

## 6. Scenario recommendations

Scenario cards include tuning recommendations based on:

- win rate
- average cycles survived
- average cascade
- average intensity
- average committed actions
- average reckless actions
- dominant action
- zero-action run count

Treat these as directional signals, not automatic balance changes.

---

## 7. Balance change log

Use the balance change log to record tuning decisions and observations.

Example:

```text
Critical Cascade too punishing after 5 valid losses.
Reduce starting cascade by 6 and retest.
```

The change log persists locally and is included in review JSON exports.

---

## 8. Scenario tuning profiles

Use scneario tuning profiles to preserve named tuning passes.

Example:

```text
Name: Softer Critical Cascade
Version: v0.1.1
Summary: Testing a less punishing critical opening.

Adjustments:
Critical Cascade: reduce starting cascade by 6
Hidden Dependency: strengthen observe prompt
Recovery Window: no change
```

Prfiles can be:

- saved locally
- exported as JSON
- deleted
- re-imported

Profiles document tuning intent. They do not currently mutate scenario constants automatically.

---

## 9. Export Types

| Export | Source | Purpose |
|---|---|---|
| Run JSON | `/playable-v01` | Individual run telemetry |
| Review JSON | `/playtest-runs` | Full lab snapshot, notes, recommendations, tuning profiles |
| Runs CSV | `/playtest-runs` | Spreadsheet-friendly run-level data |
| Scenarios CSV | `/playtest-runs` | Spreadsheet-friendly scenario summary data |
| Tuning Profile JSON | |`/playtest-runs` | Portable named tuning pass |

---

## 10. Git hygiene

Do commit:

- source code
- docs
- scenario definitions
- UI changes
- workflow docs

Do not commit by default:

- downloaded run JSON files
- downloaded review JSON files
- downloaded CSV exports
- browser-local persisted data
- ad hoc test exports

Only commit telemetry exports if intentionally archiving a curated evidence set.

---

## 11. Current tuning loop

The intended loop is:

```text
Play scenario
→ export run JSON
→ import into review lab
→ inspect dataset health
→ compare scenarios
→ write run notes
→ record balance decision
→ save tuning profile
→ adjust code constants intentionally
→ repeat
```
