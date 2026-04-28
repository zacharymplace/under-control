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

function summarizePhase(entries: any[], phase: "EARLY" | "MID" | "LATE") {
  if (!entries.length) return "No signal";

  const avgLoad = avg(entries.map((e) => e.after.load));
  const avgDrift = avg(entries.map((e) => e.after.drift));
  const avgSignal = avg(entries.map((e) => e.after.signalClarity));
  const avgIntegrity = avg(entries.map((e) => e.after.integrity));

  if (phase === "EARLY") {
    if (avgSignal >= 70 && avgDrift >= 35) {
      return "False clarity masked instability";
    }

    if (avgSignal < 60) {
      return "Signal uncertainty narrowed safe timing";
    }

    return "Operating picture formed before pressure was contained";
  }

  if (phase === "MID") {
    if (avgLoad >= 80 && avgDrift >= 40) {
      return "Pressure accumulated faster than correction";
    }

    if (avgDrift >= 45) {
      return "Instability began outpacing recovery";
    }

    if (avgIntegrity <= 65) {
      return "Structure weakened under continued pressure";
    }

    return "Control window remained open but fragile";
  }

  if (phase === "LATE") {
    if (avgDrift >= 55) {
      return "Drift exceeded recovery capacity";
    }

    if (avgLoad >= 90) {
      return "Load pressure outpaced control";
    }

    if (avgIntegrity <= 55) {
      return "Structure fell below safe operating range";
    }

    return "Recovery window narrowed into failure";
  }

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
