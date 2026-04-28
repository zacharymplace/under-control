export function getAdvisorConsensus(advisors: any[]) {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const a of advisors) {
    const action = a.suggests || a.action || a.suggestion;
    if (!action) continue;
    counts[action] = (counts[action] || 0) + 1;
    total++;
  }

  if (total === 0) {
    return { dominant: null, strength: 0 };
  }

  const [dominant, count] =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  const strength = count / total; // 0 → 1

  return { dominant, strength };
}
