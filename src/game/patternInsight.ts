export function getPatternInsight(actions: string[]) {
  if (!actions || actions.length < 5) return null;

  const counts: Record<string, number> = {};
  actions.forEach(a => counts[a] = (counts[a] || 0) + 1);

  const total = actions.length;

  const dominant = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];

  const ratio = dominant[1] / total;

  if (ratio > 0.6) {
    return `You relied heavily on ${dominant[0]} (${Math.round(ratio*100)}% of decisions). This created predictability under pressure.`;
  }

  return null;
}
