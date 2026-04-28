function confidenceWeight(level: string) {
  if (level === "HIGH") return 2;
  if (level === "LOW") return 0.5;
  return 1;
}

function trustWeight(value: number) {
  return 1 + value * 0.25; // trust amplifies influence
}

export function analyzeDisagreement(personas: any[]) {
  if (!personas || personas.length < 2) return null;

  const scores: Record<string, number> = {
    STABILIZE: 0,
    REROUTE: 0,
    OBSERVE: 0,
  };

  personas.forEach((p) => {
    const weight =
      confidenceWeight(p.confidence) *
      trustWeight(p.trust ?? 0);

    scores[p.action] += weight;
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  const top = sorted[0];
  const second = sorted[1];

  const spread = top[1] - second[1];

  let level = "LOW";
  if (spread < 0.75) level = "HIGH";
  else if (spread < 1.5) level = "MEDIUM";

  return {
    level,
    label:
      level === "HIGH"
        ? "High Disagreement"
        : level === "MEDIUM"
        ? "Partial Disagreement"
        : "Consensus",

    text:
      level === "HIGH"
        ? "Signals conflict — timing and judgment matter most."
        : level === "MEDIUM"
        ? `${top[0]} is favored, but alternatives remain viable.`
        : `${top[0]} is strongly supported by the team.`,

    consensusAction: top[0],
    scores,
    spread,
  };
}
