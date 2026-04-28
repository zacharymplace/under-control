export type PlayerTendency = {
  dominantStyle: string;
  tendencies: Record<string, number>;
  riskProfile: "conservative" | "balanced" | "reactive";
};

export function analyzePlayerTendency(actions: string[]): PlayerTendency {
  const counts: Record<string, number> = {
    STABILIZE: 0,
    REROUTE: 0,
    OBSERVE: 0,
  };

  actions.forEach((a) => {
    if (counts[a] !== undefined) counts[a]++;
  });

  const total = actions.length || 1;

  const tendencies = {
    STABILIZE: counts.STABILIZE / total,
    REROUTE: counts.REROUTE / total,
    OBSERVE: counts.OBSERVE / total,
  };

  const dominantStyle = Object.entries(tendencies).sort((a, b) => b[1] - a[1])[0][0];

  let riskProfile: PlayerTendency["riskProfile"] = "balanced";

  if (tendencies.OBSERVE > 0.5) riskProfile = "conservative";
  if (tendencies.REROUTE > 0.5) riskProfile = "reactive";

  return {
    dominantStyle,
    tendencies,
    riskProfile,
  };
}
