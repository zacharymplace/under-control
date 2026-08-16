type TimelineSnapshot = {
  load?: number;
  drift?: number;
  integrity?: number;
  signalClarity?: number;
};

type TimelineEntry = {
  action?: string;
  before: TimelineSnapshot;
  after: TimelineSnapshot;
};

export function getTurnStory(entry: TimelineEntry) {
  const loadDelta = (entry.after.load ?? 0) - (entry.before.load ?? 0);
  const driftDelta = (entry.after.drift ?? 0) - (entry.before.drift ?? 0);
  const signalDelta =
    (entry.after.signalClarity ?? 0) - (entry.before.signalClarity ?? 0);

  if (entry.action === "OBSERVE") {
    return {
      label: "Information gained",
      summary:
        signalDelta > 0
          ? "Observation improved signal, but pressure continued rising."
          : "Observation failed to materially improve clarity.",
      causal:
        signalDelta > 0
          ? "Clarity increased → response options improved, while load continued to climb."
          : "No clear signal gain → delay created additional pressure.",
    };
  }

  if (entry.action === "REROUTE") {
    return {
      label: "Pressure released",
      summary:
        driftDelta > 10
          ? "Load dropped, but instability sharply increased."
          : "Load dropped with manageable instability cost.",
      causal:
        driftDelta > 10
          ? "Capacity improved → hidden instability spiked."
          : "Capacity improved → drift stayed within manageable range.",
    };
  }

  if (entry.action === "STABILIZE") {
    return {
      label: "Structure reinforced",
      summary:
        loadDelta > 8
          ? "Integrity improved, but load pressure became more dangerous."
          : "Integrity improved without major load escalation.",
      causal:
        loadDelta > 8
          ? "Structure improved → load pressure accumulated."
          : "Structure improved → pressure remained contained.",
    };
  }

  return {
    label: "System changed",
    summary: "The system state shifted.",
    causal: "Action taken → system state changed.",
  };
}

export function getTurnRisk(entry: TimelineEntry) {
  if ((entry.after.load ?? 0) >= 95) return "LOAD CRITICAL";
  if ((entry.after.drift ?? 0) >= 55) return "DRIFT CRITICAL";
  if ((entry.after.integrity ?? 100) <= 45) return "INTEGRITY LOW";
  if ((entry.after.load ?? 0) >= 85 || (entry.after.drift ?? 0) >= 45) return "WARNING";
  return "CONTROLLED";
}

export function formatDelta(value: number) {
  if (value > 0) return `+${value}`;
  return `${value}`;
}
