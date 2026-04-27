export function getPersonaRecommendations(game: any) {
  const recs: any[] = [];

  // ELENA — Signal (prefers clarity)
  recs.push({
    name: "ELENA",
    role: "SIGNAL",
    action:
      game.signal < 60 ? "OBSERVE" : "REROUTE",
    text:
      game.signal < 60
        ? "We need better signal clarity."
        : "Signal is stable enough to act.",
  });

  // MARA — Infrastructure (protect integrity)
  recs.push({
    name: "MARA",
    role: "INFRASTRUCTURE",
    action:
      game.integrity < 50 ? "STABILIZE" : "REROUTE",
    text:
      game.integrity < 50
        ? "Integrity is at risk."
        : "We can redirect load safely.",
  });

  // ISHAAN — Risk (avoids volatility)
  recs.push({
    name: "ISHAAN",
    role: "RISK",
    action:
      game.drift > 30 ? "STABILIZE" : "OBSERVE",
    text:
      game.drift > 30
        ? "Instability is increasing."
        : "No immediate threat detected.",
  });

  return recs;
}
