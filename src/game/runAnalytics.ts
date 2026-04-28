export async function logCompletedRun(game: any) {
  if (game.state !== "FAILED" && game.state !== "STABILIZED") return;

  const payload = {
    result: game.state,
    turn: game.turn,
    pressure: game.pressure,
    load: game.load,
    integrity: game.integrity,
    signalClarity: game.signalClarity,
    drift: game.drift,
    trust: game.trust,
    summary: game.summary,
    actionHistory: game.actionHistory,
  };

  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // analytics should never break gameplay
  }
}
