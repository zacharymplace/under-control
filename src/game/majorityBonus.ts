export function getMajorityBonus(action: string, suggestions: string[]) {
  const count = suggestions.filter((s) => s === action).length;

  if (count >= 2) return 1.2;
  if (count === 1) return 1.0;
  return 0.9;
}
