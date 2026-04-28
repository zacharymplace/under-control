export function getPersonaRecommendations(game: any) {
  const trust = game.trust || {};

  const recs: any[] = [
    {
      name: "ELENA",
      role: "SIGNAL",
      action: game.signalClarity < 60 ? "OBSERVE" : "REROUTE",
      baseText:
        game.signalClarity < 60
          ? "We need better signal clarity."
          : "Signal is stable enough to act.",
    },
    {
      name: "MARA",
      role: "INFRASTRUCTURE",
      action: game.integrity < 55 || game.drift > 35 ? "STABILIZE" : "REROUTE",
      baseText:
        game.integrity < 55 || game.drift > 35
          ? "Integrity is at risk."
          : "We can redirect load safely.",
    },
    {
      name: "ISHAAN",
      role: "RISK",
      action: game.drift > 30 ? "STABILIZE" : "OBSERVE",
      baseText:
        game.drift > 30
          ? "Instability is increasing."
          : "No immediate threat detected.",
    },
  ];

  return recs.map((rec) => {
    const score = trust[rec.name] ?? 0;

    let confidence = "NEUTRAL";
    let text = rec.baseText;

    if (score >= 2) {
      confidence = "HIGH";
      text = `${rec.baseText} I stand by this.`;
    }

    if (score <= -2) {
      confidence = "LOW";
      text = `${rec.baseText} But my recent calls have been unreliable.`;
    }

    return {
      ...rec,
      text,
      confidence,
      trust: score,
    };
  });
}
