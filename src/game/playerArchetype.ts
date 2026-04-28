export function classifyPlayerArchetype(runs: any[]) {
  if (!runs.length) return "Unknown";

  let stabilize = 0;
  let reroute = 0;
  let observe = 0;

  runs.forEach((run) => {
    (run.actionHistory || []).forEach((a: string) => {
      if (a === "STABILIZE") stabilize++;
      if (a === "REROUTE") reroute++;
      if (a === "OBSERVE") observe++;
    });
  });

  const total = stabilize + reroute + observe;
  if (total === 0) return "Unknown";

  const s = stabilize / total;
  const r = reroute / total;
  const o = observe / total;

  // dominant behavior
  if (s > 0.5) return "Defensive Stabilizer";
  if (r > 0.5) return "Aggressive Rerouter";
  if (o > 0.5) return "Passive Observer";

  // mixed behaviors
  if (s > 0.35 && r > 0.35) return "Adaptive Operator";
  if (r > 0.35 && o > 0.35) return "Risk Oscillator";
  if (s > 0.35 && o > 0.35) return "Hesitant Controller";

  return "Unbalanced Generalist";
}
