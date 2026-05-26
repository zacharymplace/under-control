import { getIgnoredPenalty, getTrustModifier } from "./personaPenalty";
import { getAdvisorWeight } from "./advisorWeighting";
import type { AdvisorMemoryMap } from "./advisorMemory";
import { getPressureDistortion } from "./pressureDistortion";

type PersonaConfidenceAdvisor = {
  name?: string;
  suggests?: string | null;
  action?: string | null;
  suggestion?: string | null;
  [key: string]: unknown;
};

type PersonaConfidenceGameState = {
  signalClarity?: number;
  signal?: number;
  integrity?: number;
  drift?: number;
  load?: number;
  pressure?: string;
  trust?: Record<string, number | undefined>;
  ignoredCounts?: Record<string, number | undefined>;
  advisorMemory?: AdvisorMemoryMap;
  personas?: PersonaConfidenceAdvisor[];
};

export function getPersonaConfidence(
  persona: PersonaConfidenceAdvisor,
  game: PersonaConfidenceGameState
) {
  const name = (persona.name || "").toUpperCase();
  const signal = game.signalClarity ?? game.signal ?? 0;
  const integrity = game.integrity ?? 0;
  const drift = game.drift ?? 0;
  const load = game.load ?? 0;

  let base = 1;

  if (name === "ELENA") {
    if (signal >= 70) base = 1.4;
    else if (signal >= 55) base = 1.1;
    else base = 0.75;
  } else if (name === "MARA") {
    if (integrity <= 65) base = 1.4;
    else if (integrity <= 80) base = 1.15;
    else base = 0.9;
  } else if (name === "ISHAAN") {
    if (drift >= 45 || load >= 85) base = 1.4;
    else if (drift >= 25 || load >= 75) base = 1.15;
    else base = 0.85;
  }

  const trustModifier = getTrustModifier(name, game);
  const ignoredPenalty = getIgnoredPenalty(name, game);
  const advisorMemoryWeight = getAdvisorWeight(name, game.advisorMemory);

  return Number(
    (base * trustModifier * ignoredPenalty * advisorMemoryWeight).toFixed(2)
  );
}

export function buildWeightedSupport(game: PersonaConfidenceGameState) {
  const support: Record<string, number> = {
    STABILIZE: 0,
    REROUTE: 0,
    OBSERVE: 0,
  };

  const advisors = game.personas || [];

  advisors.forEach((persona) => {
    const suggestion =
      persona.suggests || persona.action || persona.suggestion || "UNKNOWN";

    if (!(suggestion in support)) return;

    support[suggestion] += getPersonaConfidence(persona, game);
  });

  Object.keys(support).forEach((action) => {
    support[action] = Number(
      (support[action] * getPressureDistortion(action, game)).toFixed(2)
    );
  });

  const entries = Object.entries(support);

  let dominantAction: string | null = null;
  let maxScore = -Infinity;

  for (const [action, value] of entries) {
    if (value > maxScore) {
      maxScore = value;
      dominantAction = action;
    }
  }

  const result: Record<string, number> = {};
  for (const [action, value] of entries) {
    if (action === dominantAction) {
      result[action] = value * 1.2;
    } else {
      result[action] = value * 0.85;
    }
  }

  return result;
}

export function getWeightedSupportMultiplier(
  action: string,
  game: PersonaConfidenceGameState
) {
  const support = buildWeightedSupport(game);
  const values = Object.values(support);
  const max = Math.max(...values);
  const current = support[action] ?? 0;

  if (current === 0) return 0.9;
  if (current === max && max > 0) return 1.2;
  return 1;
}
