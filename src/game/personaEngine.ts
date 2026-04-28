export function getPersonaRecommendations(game: any) {
  const recs: any[] = [];

  recs.push({
    name: "ELENA",
    role: "SIGNAL",
    action: game.signalClarity < 60 ? "OBSERVE" : "REROUTE",
    text:
      game.signalClarity < 60
        ? "We need better signal clarity."
        : "Signal is stable enough to act.",
  });

  recs.push({
    name: "MARA",
    role: "INFRASTRUCTURE",
    action: game.integrity < 55 || game.drift > 35 ? "STABILIZE" : "REROUTE",
    text:
      game.integrity < 55 || game.drift > 35
        ? "Integrity is at risk."
        : "We can redirect load safely.",
  });

  recs.push({
    name: "ISHAAN",
    role: "RISK",
    action: game.drift > 30 ? "STABILIZE" : "OBSERVE",
    text:
      game.drift > 30
        ? "Instability is increasing."
        : "No immediate threat detected.",
  });

  return recs;
}
