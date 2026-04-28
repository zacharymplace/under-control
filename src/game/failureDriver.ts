export function getPrimaryFailureDriver(game: any) {
  const log = game.actionLog || [];
  if (!log.length) return null;

  const last = log.slice(-3);
  const actions = last.map((x: any) => x.action);
  const final = log[log.length - 1]?.after || game;

  if (final.load >= 100) {
    if (actions.filter((a: string) => a === "STABILIZE").length >= 2) {
      return {
        title: "Load reached capacity before relief landed",
        detail:
          "Repeated stabilization protected structure but allowed load to hit the failure threshold.",
      };
    }

    return {
      title: "Capacity collapsed before pressure was released",
      detail:
        "Load reached the failure threshold before enough relief actions created room.",
    };
  }

  if (final.drift >= 60) {
    return {
      title: "Drift overwhelmed recovery capacity",
      detail:
        "Repeated reroutes reduced load but accumulated instability faster than it could be corrected.",
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
    detail:
      "No single decision ended the run, but the sequence narrowed recovery options.",
  };
}
