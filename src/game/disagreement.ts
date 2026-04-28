export function analyzeDisagreement(personas: any[]) {
  if (!personas || personas.length < 2) return null;

  const actionCounts: Record<string, number> = {
    STABILIZE: 0,
    REROUTE: 0,
    OBSERVE: 0,
  };

  personas.forEach((p) => {
    if (actionCounts[p.action] !== undefined) {
      actionCounts[p.action]++;
    }
  });

  const uniqueActions = Object.values(actionCounts).filter((count) => count > 0).length;
  const consensusAction = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0];

  if (uniqueActions >= 3) {
    return {
      level: "HIGH",
      label: "High Disagreement",
      text: "The team is split. No action has clear consensus.",
      consensusAction: null,
    };
  }

  if (uniqueActions === 2) {
    return {
      level: "MEDIUM",
      label: "Partial Disagreement",
      text: `${consensusAction[0]} has the strongest support, but not full consensus.`,
      consensusAction: consensusAction[0],
    };
  }

  return {
    level: "LOW",
    label: "Consensus",
    text: `${consensusAction[0]} has full team alignment.`,
    consensusAction: consensusAction[0],
  };
}
