import { normalizeConfidence, computeEffectiveWeight } from "./effectiveWeight";

export function getWeightBreakdown(advisor: any, credibilityMap: Record<string, number> = {}) {
  const key = String(advisor.id || advisor.name || advisor.label || "").toUpperCase();

  const confidence = normalizeConfidence(advisor.confidence);
  const credibility = credibilityMap[key] ?? 0.5;
  const trust = advisor.trust ?? advisor.weight ?? 1;

  const weight = computeEffectiveWeight({
    confidence,
    credibility,
    trust,
  });

  return {
    key,
    confidence,
    credibility,
    trust,
    weight: Number(weight.toFixed(3)),
  };
}
