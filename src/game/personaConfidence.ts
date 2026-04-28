export function getPersonaConfidence(persona: any, game: any) {
  const name = (persona.name || "").toUpperCase();
  const signal = game.signalClarity ?? game.signal ?? 0;
  const integrity = game.integrity ?? 0;
  const drift = game.drift ?? 0;
  const load = game.load ?? 0;

  if (name === "ELENA") {
    if (signal >= 70) return 1.4;
    if (signal >= 55) return 1.1;
    return 0.75;
  }

  if (name === "MARA") {
    if (integrity <= 65) return 1.4;
    if (integrity <= 80) return 1.15;
    return 0.9;
  }

  if (name === "ISHAAN") {
    if (drift >= 45 || load >= 85) return 1.4;
    if (drift >= 25 || load >= 75) return 1.15;
    return 0.85;
  }

  return 1;
}

export function buildWeightedSupport(game: any) {
  const support: Record<string, number> = {
    STABILIZE: 0,
    REROUTE: 0,
    OBSERVE: 0,
  };

  const advisors = game.personas || [];

  advisors.forEach((persona: any) => {
    const suggestion =
      persona.suggests || persona.action || persona.suggestion || "UNKNOWN";

    if (!(suggestion in support)) return;

    support[suggestion] += getPersonaConfidence(persona, game);
  });

  return support;
}

export function getWeightedSupportMultiplier(action: string, game: any) {
  const support = buildWeightedSupport(game);
  const values = Object.values(support);
  const max = Math.max(...values);
  const current = support[action] ?? 0;

  if (current === 0) return 0.9;
  if (current === max && max > 0) return 1.2;
  return 1;
}
