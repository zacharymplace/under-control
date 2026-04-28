export function getDisagreementPenalty(suggestions: string[]) {
  const unique = new Set(suggestions).size;

  if (unique === 1) return 1.2;     // strong alignment
  if (unique === 2) return 1.0;     // partial disagreement
  if (unique === 3) return 0.85;    // full disagreement

  return 1;
}
