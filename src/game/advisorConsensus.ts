import { getAdvisorCredibility, type AdvisorCredibilityMap } from "./advisorCredibility";
import { computeEffectiveWeight } from "./effectiveWeight";

function getAdvisorAction(advisor: any) {
  return advisor.suggests || advisor.action || advisor.suggestion || null;
}

export function getAdvisorConsensus(
  advisors: any[],
  credibility: AdvisorCredibilityMap = {}
) {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const advisor of advisors) {
    const action = getAdvisorAction(advisor);
    if (!action) continue;

    const weight = computeEffectiveWeight({
      confidence: advisor.confidence,
      credibility: getAdvisorCredibility(advisor, credibility),
      trust: advisor.trust ?? advisor.weight ?? 1,
    });

    counts[action] = (counts[action] || 0) + weight;
    total += weight;
  }

  if (total <= 0) {
    return { dominant: null, strength: 0, counts };
  }

  const [dominant, score] =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [null, 0];

  return {
    dominant,
    strength: Number((score / total).toFixed(2)),
    counts,
  };
}
