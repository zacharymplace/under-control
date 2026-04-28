import { AdvisorMemoryMap, normalizeAdvisorMemory } from "./advisorMemory";

export function getAdvisorWeight(name: string, memory?: AdvisorMemoryMap) {
  const key = name.toUpperCase();
  const m = normalizeAdvisorMemory(memory)[key];

  if (!m) return 1;

  const totalCalls = m.correctCalls + m.incorrectCalls;
  const reliability = totalCalls === 0
    ? 1
    : (m.correctCalls + 1) / (totalCalls + 2);

  const ignoredPenalty = Math.max(0.65, 1 - m.ignoredCount * 0.04);
  const trustModifier = Math.max(0.7, Math.min(1.3, 1 + m.trustDelta * 0.05));
  const stressPenalty = Math.max(0.85, 1 - m.stressLevel * 0.03);

  const raw = reliability * ignoredPenalty * stressPenalty;
  const weight = raw * 0.7 + trustModifier * 0.3;

  return Number(weight.toFixed(2));
}

export function getAdvisorWeightLabel(weight: number) {
  if (weight >= 1.2) return "Reinforced";
  if (weight >= 0.9) return "Stable";
  if (weight >= 0.65) return "Degraded";
  return "Compromised";
}
