export function getDisagreementPenalty(advisors: any[]) {
  if (!advisors || advisors.length === 0) return 1;

  const suggestions = advisors.map(
    (a) => a.suggests || a.action || a.suggestion
  );

  const unique = new Set(suggestions.filter(Boolean));

  if (unique.size <= 1) return 1;

  // mild penalty for 2-way disagreement, stronger for 3-way
  if (unique.size === 2) return 0.9;
  return 0.8;
}
