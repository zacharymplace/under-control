type FailureSnapshot = {
  load?: number;
  drift?: number;
};

type FailureLogEntry = {
  action?: string;
  before: FailureSnapshot;
  after: FailureSnapshot;
};

type FailureGameState = {
  scenarioId?: string;
  signalClarity?: number;
};

export function analyzeFailure(log: FailureLogEntry[], game?: FailureGameState) {
  if (!log || log.length < 3) return null;

  const scenarioId = game?.scenarioId;
  const peakLoad = Math.max(...log.map((entry) => entry.after?.load ?? 0));
  const peakDrift = Math.max(...log.map((entry) => entry.after?.drift ?? 0));

  if (scenarioId === "signal_chaos" && (game?.signalClarity ?? 100) < 65) {
    return {
      label: "Signal Misread",
      insight: "The run stayed noisy long enough for pressure to compound.",
      recommendation: "Observe earlier, then act before load crosses the danger zone.",
    };
  }

  if (scenarioId === "load_crisis" && peakLoad >= 100) {
    return {
      label: "Capacity Saturation",
      insight: "The system entered the run too close to load capacity.",
      recommendation: "Reroute earlier, then stabilize after pressure is released.",
    };
  }

  if (scenarioId === "drift_collapse" && peakDrift >= 55) {
    return {
      label: "Drift Collapse",
      insight: "Hidden instability crossed the recovery threshold.",
      recommendation: "Stabilize before drift compounds past the mid-40s.",
    };
  }

  let pressureSpikes = 0;
  let lateStabilizes = 0;
  let driftIgnored = 0;

  for (let i = 1; i < log.length; i++) {
    const prev = log[i - 1];
    const curr = log[i];

    if ((curr.after.load ?? 0) > (prev.after.load ?? 0)) pressureSpikes++;

    if ((prev.after.drift ?? 0) > 40 && curr.action !== "STABILIZE") {
      driftIgnored++;
    }

    if (curr.action === "STABILIZE" && (curr.before.load ?? 0) > 85) {
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
