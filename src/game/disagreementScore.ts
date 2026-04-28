export function getDisagreementPenalty(suggestions: string[]) {
  const clean = suggestions.filter(Boolean);
  const unique = new Set(clean);

  if (unique.size <= 1) return 1;
  if (unique.size === 2) return 0.9;
  return 0.8;
}
