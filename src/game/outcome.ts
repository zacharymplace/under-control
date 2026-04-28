export function evaluateOutcome(prev: any, next: any, personas: any[]) {
  const loadImproved = next.load < prev.load;
  const integrityImproved = next.integrity > prev.integrity;
  const driftImproved = next.drift < prev.drift;

  let baseScore =
    (loadImproved ? 1 : -1) +
    (integrityImproved ? 1 : -1) +
    (driftImproved ? 1 : -1);

  // trust-weighted adjustment
  let trustInfluence = 0;

  personas.forEach((p) => {
    if (p.trust > 1) trustInfluence += 0.5;
    if (p.trust < -1) trustInfluence -= 0.5;
  });

  const finalScore = baseScore + trustInfluence;

  if (finalScore >= 2) return "GOOD";
  if (finalScore <= -2) return "BAD";
  return "NEUTRAL";
}
