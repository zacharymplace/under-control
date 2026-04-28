export function getTurnStory(entry: any) {
  const loadDelta = entry.after.load - entry.before.load;
  const driftDelta = entry.after.drift - entry.before.drift;
  const integrityDelta = entry.after.integrity - entry.before.integrity;
  const signalDelta = entry.after.signalClarity - entry.before.signalClarity;

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

export function getTurnRisk(entry: any) {
  if (entry.after.load >= 95) return "LOAD CRITICAL";
  if (entry.after.drift >= 55) return "DRIFT CRITICAL";
  if (entry.after.integrity <= 45) return "INTEGRITY LOW";
  if (entry.after.load >= 85 || entry.after.drift >= 45) return "WARNING";
  return "CONTROLLED";
}

export function formatDelta(value: number) {
  if (value > 0) return `+${value}`;
  return `${value}`;
}
