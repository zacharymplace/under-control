export function buildRunArc(game: any, failureDriver: any) {
  const log = game.actionLog || [];
  if (!log.length) return null;

  const firstThird = log.slice(0, Math.ceil(log.length / 3));
  const middleThird = log.slice(
    Math.ceil(log.length / 3),
    Math.ceil((log.length * 2) / 3)
  );
  const finalThird = log.slice(Math.ceil((log.length * 2) / 3));

  return {
    early: summarizePhase(firstThird, "EARLY"),
    middle: summarizePhase(middleThird, "MID"),
    late: summarizePhase(finalThird, "LATE"),
    failureMode: failureDriver?.title || "Failure pattern unclear",
    difficulty: classifyDifficulty(game),
  };
}

function summarizePhase(entries: any[], phase: string) {
  if (!entries.length) return "No signal";

  const avgLoad = avg(entries.map((e) => e.after.load));
  const avgDrift = avg(entries.map((e) => e.after.drift));
  const avgSignal = avg(entries.map((e) => e.after.signalClarity));
  const avgIntegrity = avg(entries.map((e) => e.after.integrity));

  if (avgSignal < 60 && phase === "EARLY") return "Signal unreliable";
  if (avgLoad >= 85 && avgDrift < 50) return "Load pressure rising";
  if (avgDrift >= 50) return "Drift dominant";
  if (avgIntegrity <= 60) return "Integrity weakening";
  if (avgSignal >= 70) return "Clarity improving";

  
if (phase == "EARLY") return "Signal unreliable";
if (phase == "MID") return "Pressure accumulating";
if (phase == "LATE") return "System breakdown forming";
return "Mixed state";

}

function classifyDifficulty(game: any) {
  const summary = game.summary || {};
  const peakLoad = summary.peakLoad ?? game.load ?? 0;
  const peakDrift = summary.peakDrift ?? game.drift ?? 0;
  const avgPressure = summary.avgPressure ?? 0;

  if (peakLoad >= 98 && peakDrift >= 60) {
    return {
      label: "Unforgiving",
      detail: "Load and drift both reached severe ranges.",
    };
  }

  if (avgPressure >= 85) {
    return {
      label: "Narrow",
      detail: "Recovery required earlier intervention.",
    };
  }

  return {
    label: "Winnable",
    detail: "The run had recoverable windows before failure.",
  };
}

function avg(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
