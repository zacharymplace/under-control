export function findPointOfNoReturn(log: any[]) {
  if (!log || log.length < 3) return null;

  for (let i = 1; i < log.length; i++) {
    const prev = log[i - 1];
    const curr = log[i];

    const highLoad = curr.after.load > 90;
    const risingDrift = curr.after.drift > prev.after.drift;
    const noCorrection =
      curr.action !== "STABILIZE" && curr.action !== "REROUTE";

    if (highLoad && risingDrift && noCorrection) {
      return {
        turn: curr.turn,
        reason: "High load + rising drift without corrective action",
      };
    }
  }

  return null;
}
