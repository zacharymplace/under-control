export function getPrimaryFailureDriver(game: any) {
  const log = game.actionLog || [];
  if (!log.length) return null;

  const last = log.slice(-3);
  const actions = last.map((x: any) => x.action);

  const final = log[log.length - 1]?.after || game;

  if (final.load >= 100) {
    if (actions.filter((a: string) => a === "STABILIZE").length >= 2) {
      return {
        title: "Load was allowed to saturate",
        detail: "Repeated stabilization protected integrity but did not release enough capacity.",
      };
    }

    return {
      title: "Capacity collapsed under pressure",
      detail: "Load reached the failure threshold before enough pressure was released.",
    };
  }

  if (final.drift >= 60) {
    return {
      title: "Drift became unrecoverable",
      detail: "Reroutes reduced load but compounded hidden instability.",
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
