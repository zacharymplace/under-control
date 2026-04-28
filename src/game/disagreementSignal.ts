export function detectDisagreement(suggestions: string[]) {
  const unique = new Set(suggestions);
  return unique.size > 1;
}
