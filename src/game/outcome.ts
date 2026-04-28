export function evaluateOutcome(prev: any, next: any) {
  const loadImproved = next.load < prev.load;
  const integrityImproved = next.integrity > prev.integrity;
  const driftImproved = next.drift < prev.drift;

  const score =
    (loadImproved ? 1 : -1) +
    (integrityImproved ? 1 : -1) +
    (driftImproved ? 1 : -1);

  if (score >= 2) return "GOOD";
  if (score <= -2) return "BAD";
  return "NEUTRAL";
}
