import { getAdvisorCredibility, type AdvisorCredibilityMap } from "./advisorCredibility";
import { computeEffectiveWeight } from "./effectiveWeight";

export type AdvisorConsensusAdvisor = {
  suggests?: string | null;
  action?: string | null;
  suggestion?: string | null;
  confidence?: number | string | null;
  trust?: number | string | null;
  weight?: number | string | null;
  [key: string]: unknown;
};

function getAdvisorAction(advisor: AdvisorConsensusAdvisor) {
  return advisor.suggests || advisor.action || advisor.suggestion || null;
}

function toOptionalNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function toNumber(value: number | string | null | undefined, fallback: number) {
  return toOptionalNumber(value) ?? fallback;
}

export function getAdvisorConsensus(
  advisors: AdvisorConsensusAdvisor[],
  credibility: AdvisorCredibilityMap = {}
) {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const advisor of advisors) {
    const action = getAdvisorAction(advisor);
    if (!action) continue;

    const weight = computeEffectiveWeight({
      confidence: toOptionalNumber(advisor.confidence),
      credibility: getAdvisorCredibility(advisor, credibility),
      trust: toNumber(advisor.trust ?? advisor.weight, 1),
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
