export function getAdvisorCredibilityLabel(value: number | undefined) {
  const trust = value ?? 0.5;

  if (trust >= 0.75) return "Credibility: high";
  if (trust >= 0.55) return "Credibility: stable";
  if (trust >= 0.35) return "Credibility: uncertain";

  return "Credibility: degraded";
}
