export function analyzeFailure(log: any[]) {
  if (!log || log.length < 3) return null;

  let pressureSpikes = 0;
  let lateStabilizes = 0;
  let driftIgnored = 0;

  for (let i = 1; i < log.length; i++) {
    const prev = log[i - 1];
    const curr = log[i];

    // pressure spike (load increasing repeatedly)
    if (curr.after.load > prev.after.load) {
      pressureSpikes++;
    }

    // drift rising but not addressed
    if (
      prev.after.drift > 40 &&
      curr.action !== "STABILIZE"
    ) {
      driftIgnored++;
    }

    // stabilizing too late (high load)
    if (
      curr.action === "STABILIZE" &&
      curr.before.load > 85
    ) {
      lateStabilizes++;
    }
  }

  if (driftIgnored > 2) {
    return {
      label: "Drift Mismanagement",
      insight: "Drift exceeded safe levels without early stabilization.",
      recommendation: "Stabilize earlier when drift crosses ~40.",
    };
  }

  if (pressureSpikes > 3) {
    return {
      label: "Pressure Escalation",
      insight: "Load increased across consecutive turns.",
      recommendation: "Reroute earlier to release pressure.",
    };
  }

  if (lateStabilizes > 2) {
    return {
      label: "Late Stabilization",
      insight: "Stabilization actions came after critical load levels.",
      recommendation: "Stabilize before load exceeds ~85.",
    };
  }

  return {
    label: "General Instability",
    insight: "Multiple small inefficiencies compounded.",
    recommendation: "Balance actions earlier across signals.",
  };
}
