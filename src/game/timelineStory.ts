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
          ? "Signal improved, but pressure continued moving."
          : "Observation failed to materially improve clarity.",
    };
  }

  if (entry.action === "REROUTE") {
    return {
      label: "Pressure released",
      summary:
        driftDelta > 10
          ? "Load dropped, but instability sharply increased."
          : "Load dropped with manageable instability cost.",
    };
  }

  if (entry.action === "STABILIZE") {
    return {
      label: "Structure reinforced",
      summary:
        loadDelta > 8
          ? "Integrity improved, but load pressure became more dangerous."
          : "Integrity improved without major load escalation.",
    };
  }

  return {
    label: "System changed",
    summary: "The system state shifted.",
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
