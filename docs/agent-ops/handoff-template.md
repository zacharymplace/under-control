# Claude Handoff Template

Read CLAUDE.md, AGENTS.md, README.md, package.json, and relevant docs first.

Task:
[Describe the exact change.]

Constraints:
- Keep the diff small.
- Do not change unrelated files.
- Do not move game logic into React.
- Do not change reducer behavior, advisor/persona logic, scoring, pressure, collapse, recovery, or telemetry semantics unless explicitly required.
- Do not perform broad lint cleanup in the same patch.
- Do not add dependencies unless necessary and justified.

Validation:
- npm run agent:preflight
- npm run release:ready

Output:
- Summary
- Files changed
- Validation results
- Risks
- Next recommended patch

Do not push.
