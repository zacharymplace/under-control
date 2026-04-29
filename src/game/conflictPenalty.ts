export function getConflictPenalty(strength: number) {
  if (strength >= 0.75) return 1;
  if (strength >= 0.5) return 0.85;
  return 0.7;
}
