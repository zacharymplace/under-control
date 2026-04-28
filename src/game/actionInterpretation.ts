export function interpretActionScore(score: number, maxScore: number) {
  if (maxScore <= 0 || score <= 0) return "Rejected";

  const ratio = score / maxScore;

  if (ratio >= 0.85) return "Strongly favored";
  if (ratio >= 0.5) return "Viable";
  if (ratio >= 0.2) return "Weak signal";

  return "Low confidence";
}

export function getTeamAlignment(scores: Record<string, number>) {
  const values = Object.values(scores || {});
  if (!values.length) return "UNKNOWN";

  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = max - min;

  if (spread > 4) return "LOW";
  if (spread > 2) return "MEDIUM";
  return "HIGH";
}
