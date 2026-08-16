type FailureDriverSnapshot = {
  drift?: number;
  load?: number;
  integrity?: number;
};

type FailureDriverLogEntry = {
  action?: string;
  after?: FailureDriverSnapshot;
};

type FailureDriverGameState = FailureDriverSnapshot & {
  actionLog?: FailureDriverLogEntry[];
};

export function getPrimaryFailureDriver(game: FailureDriverGameState) {
  const log = game.actionLog || [];
  if (!log.length) return null;

  const last = log.slice(-4);
  const actions = last.map((entry) => entry.action);
  const final = log[log.length - 1]?.after || game;

  if ((final.drift ?? 0) >= 60) {
    const reroutes = actions.filter((action) => action === "REROUTE").length;

    if (reroutes >= 2) {
      return {
        title:
          "Drift exceeded recovery capacity after repeated load relief without instability reduction",
        detail:
          "Reroutes reduced visible load, but hidden instability compounded faster than the system could absorb.",
      };
    }

    return {
      title: "Drift overwhelmed recovery capacity",
      detail:
        "Instability crossed the recoverable range before stabilizing actions could reduce it.",
    };
  }

  if ((final.load ?? 0) >= 100) {
    const stabilizes = actions.filter((action) => action === "STABILIZE").length;

    if (stabilizes >= 2) {
      return {
        title:
          "Load reached capacity after repeated stabilization without pressure relief",
        detail:
          "Stabilization preserved structure, but load continued accumulating until capacity failed.",
      };
    }

    return {
      title: "Capacity collapsed before pressure was released",
      detail:
        "Load reached the failure threshold before enough relief actions created room.",
    };
  }

  if ((final.integrity ?? 100) <= 45) {
    return {
      title: "Integrity degraded below recovery range",
      detail: "The system could no longer absorb stress safely.",
    };
  }

  return {
    title: "Small timing errors compounded into system failure",
    detail:
      "No single decision ended the run, but the sequence narrowed recovery options until failure became likely.",
  };
}
