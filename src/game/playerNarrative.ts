export function buildPlayerNarrative(profile: any, runs: any[]) {
  if (!profile || !runs || runs.length < 2) return null;

  const recent = runs.slice(-5);
  const failed = recent.filter((run: any) => run.state === "FAILED").length;

  const lines: string[] = [];

  lines.push(`Across ${runs.length} runs, your current pattern is ${profile.tendency}.`);

  if (profile.dominantAction === "STABILIZE") {
    lines.push(
      "You tend to preserve structure, but pressure relief often arrives too late."
    );
  }

  if (profile.dominantAction === "REROUTE") {
    lines.push(
      "You are effective at reducing visible load, but repeated rerouting can hide accumulating drift."
    );
  }

  if (profile.dominantAction === "OBSERVE") {
    lines.push(
      "You prioritize signal clarity, but delay can let pressure move faster than recovery."
    );
  }

  if (failed >= 3) {
    lines.push(
      "Recent failures cluster around escalation timing rather than action selection."
    );
  }

  return {
    title: "Cross-run coaching insight",
    lines,
  };
}
