export function analyzePatterns(runs: any[]) {
  if (!runs.length) return null;

  let stabilizeOveruse = 0;
  let rerouteOveruse = 0;
  let observeDelay = 0;

  runs.forEach((run) => {
    const actions = run.actionHistory || [];

    const stabilizeCount = actions.filter((a: string) => a === "STABILIZE").length;
    const rerouteCount = actions.filter((a: string) => a === "REROUTE").length;

    if (stabilizeCount > rerouteCount + 2) stabilizeOveruse++;
    if (rerouteCount > stabilizeCount + 2) rerouteOveruse++;

    if (actions.slice(0, 3).every((a: string) => a !== "OBSERVE")) {
      observeDelay++;
    }
  });

  const insights = [];

  if (stabilizeOveruse > runs.length * 0.5) {
    insights.push("Over-reliance on STABILIZE may be allowing load to accumulate.");
  }

  if (rerouteOveruse > runs.length * 0.5) {
    insights.push("Excessive REROUTE is increasing instability (drift).");
  }

  if (observeDelay > runs.length * 0.5) {
    insights.push("Early OBSERVE actions are underused; signal clarity may be too low.");
  }

  return insights;
}
