export function getPersonaRecommendations(game: any) {
  const trust = game.trust || {};
  const ignored = game.ignoredCounts || {};

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
    const trustScore = trust[rec.name] ?? 0;
    const ignoredCount = ignored[rec.name] ?? 0;

    let confidence = "NEUTRAL";
    let text = rec.baseText;

    if (trustScore >= 2) {
      confidence = "HIGH";
      text = `${rec.baseText} I stand by this.`;
    }

    if (trustScore <= -2) {
      confidence = "LOW";
      text = `${rec.baseText} But my recent calls have been unreliable.`;
    }

    if (ignoredCount >= 3 && trustScore >= 0) {
      text = `${rec.baseText} You've been overriding my calls.`;
    }

    if (ignoredCount >= 5) {
      text = `${rec.baseText} Pattern noted: my recommendations are being deprioritized.`;
    }

    return {
      ...rec,
      text,
      confidence,
      trust: trustScore,
      ignoredCount,
    };
  });
}
