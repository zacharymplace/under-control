export function getConflictSeverity(suggestions: string[]) {
  const counts: Record<string, number> = {};
  suggestions.forEach((s) => {
    counts[s] = (counts[s] || 0) + 1;
  });

  const unique = Object.keys(counts).length;

  if (unique === 1) return "NONE";
  if (unique === 2) return "PARTIAL";
  return "HIGH";
}

export function getLockedActions(
  suggestions: string[],
  severity: string
) {
  if (severity !== "HIGH") return [];

  const counts: Record<string, number> = {};
  suggestions.forEach((s) => {
    counts[s] = (counts[s] || 0) + 1;
  });

  // find lowest support action
  const sorted = Object.entries(counts).sort((a, b) => a[1] - b[1]);
  return [sorted[0][0]];
}
