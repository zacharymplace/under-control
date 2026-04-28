export type PlayerProfile = {
  totalRuns: number;
  dominantAction: string;
  averageTurn: number;
  commonFailure: string;
  tendency: string;
  coachingNote: string;
};

export function buildPlayerProfile(runs: any[]): PlayerProfile | null {
  if (!runs || runs.length < 2) return null;

  const completed = runs.filter(Boolean);
  if (!completed.length) return null;

  const actionCounts: Record<string, number> = {};
  const failureCounts: Record<string, number> = {};
  let totalTurns = 0;

  completed.forEach((run) => {
    totalTurns += Number(run.turn ?? run.summary?.turns ?? 0);

    const actions =
      run.actionLog?.map((x: any) => x.action) ||
      run.actions ||
      [];

    actions.forEach((action: string) => {
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });

    const failure =
      run.summary?.cause ||
      run.failureDriver?.title ||
      run.cause ||
      "Unknown";

    failureCounts[failure] = (failureCounts[failure] || 0) + 1;
  });

  const dominantAction = topKey(actionCounts) || "Mixed";
  const commonFailure = topKey(failureCounts) || "Unknown";
  const averageTurn = Math.round(totalTurns / completed.length);

  const tendency = classifyTendency({
    dominantAction,
    commonFailure,
    averageTurn,
  });

  return {
    totalRuns: completed.length,
    dominantAction,
    averageTurn,
    commonFailure,
    tendency: tendency.label,
    coachingNote: tendency.note,
  };
}

function classifyTendency({
  dominantAction,
  commonFailure,
  averageTurn,
}: {
  dominantAction: string;
  commonFailure: string;
  averageTurn: number;
}) {
  if (dominantAction === "STABILIZE" && commonFailure.toLowerCase().includes("load")) {
    return {
      label: "Late Stabilizer",
      note:
        "You protect structure, but often wait too long to create capacity before load saturates.",
    };
  }

  if (dominantAction === "REROUTE" && commonFailure.toLowerCase().includes("drift")) {
    return {
      label: "Pressure Reliever",
      note:
        "You reduce visible load effectively, but hidden instability tends to compound across turns.",
    };
  }

  if (dominantAction === "OBSERVE" && averageTurn < 8) {
    return {
      label: "Signal Seeker",
      note:
        "You gather information early, but delay can let pressure move faster than recovery.",
    };
  }

  if (averageTurn >= 10) {
    return {
      label: "Survivor",
      note:
        "You extend runs well, but the final failure usually comes from mistimed late intervention.",
    };
  }

  return {
    label: "Balanced Responder",
    note:
      "You vary actions across runs, but still need sharper timing around escalation phases.",
  };
}

function topKey(values: Record<string, number>) {
  return Object.entries(values).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}
