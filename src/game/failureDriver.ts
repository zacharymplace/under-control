export function getPrimaryFailureDriver(game: any) {
  const log = game.actionLog || [];
  if (!log.length) return null;

  const last = log.slice(-3);
  const actions = last.map((x: any) => x.action);

  const final = log[log.length - 1]?.after || game;

  if (final.load >= 100) {
    if (actions.filter((a: string) => a === "STABILIZE").length >= 2) {
      return {
        title: "Load saturated faster than capacity could recover",
        detail: "Repeated stabilization protected structure but allowed load to reach the failure threshold.",
      };
    }

    return {
      title: "Capacity collapsed under pressure",
      detail: "Load reached the failure threshold before enough pressure was released.",
    };
  }

  if (final.drift >= 60) {
    return {
      title: "Drift overwhelmed recovery capacity",
      detail: "Repeated reroutes reduced load but accumulated instability faster than it could be corrected.",
    };
  }

  if (final.integrity <= 45) {
    return {
      title: "Integrity degraded below recovery range",
      detail: "The system could no longer absorb stress safely.",
    };
  }

  return {
    title: "Small timing errors compounded",
    detail: "No single decision ended the run, but the sequence narrowed recovery options.",
  };
}
