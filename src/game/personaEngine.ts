import {
  applyProfileBias,
  getPersonaProfile,
  profileConfidenceAdjustment,
  profileVoicePrefix,
} from "./personaProfile";
import { applyMoodToText, derivePersonaMood } from "./personaMood";

export type PersonaEngineGameState = {
  scenarioId?: string;
  signalClarity?: number;
  signal?: number;
  integrity?: number;
  drift?: number;
  load?: number;
  turn?: number;
  trust?: Record<string, number | undefined>;
  ignoredCounts?: Record<string, number | undefined>;
  [key: string]: unknown;
};

type PersonaStrategy = "DEFENSIVE" | "ASSERTIVE" | "ADAPTIVE";
type PersonaAction = "STABILIZE" | "REROUTE" | "OBSERVE";

type PersonaConfig = {
  name: "ELENA" | "MARA" | "ISHAAN";
  role: string;
  decide: (game: PersonaEngineGameState, strategy: PersonaStrategy) => PersonaAction;
  text: (game: PersonaEngineGameState) => string;
};

function signalOf(game: PersonaEngineGameState) {
  return game.signalClarity ?? game.signal ?? 0;
}

function integrityOf(game: PersonaEngineGameState) {
  return game.integrity ?? 0;
}

function driftOf(game: PersonaEngineGameState) {
  return game.drift ?? 0;
}

function loadOf(game: PersonaEngineGameState) {
  return game.load ?? 0;
}

function deriveStrategy(trust: number, ignored: number): PersonaStrategy {
  if (trust <= -2) return "DEFENSIVE";
  if (ignored >= 4) return "ASSERTIVE";
  return "ADAPTIVE";
}

function scenarioBias(game: PersonaEngineGameState, name: string) {
  const id = game.scenarioId;

  if (id === "signal_chaos" && name === "ELENA") return 1;
  if (id === "load_crisis" && name === "ISHAAN") return 1;
  if (id === "drift_collapse" && name === "MARA") return 1;
  if (id === "drift_collapse" && name === "ISHAAN") return 1;

  return 0;
}

export function getPersonaRecommendations(game: PersonaEngineGameState) {
  const trust = game.trust || {};
  const ignored = game.ignoredCounts || {};

  const base: PersonaConfig[] = [
    {
      name: "ELENA",
      role: "SIGNAL",
      decide: (g, strategy) => {
        if (strategy === "DEFENSIVE") return "OBSERVE";
        return signalOf(g) < 60 ? "OBSERVE" : "REROUTE";
      },
      text: (g) =>
        signalOf(g) < 60
          ? "We need better signal clarity."
          : "Signal is stable enough to act.",
    },
    {
      name: "MARA",
      role: "INFRASTRUCTURE",
      decide: (g, strategy) => {
        if (strategy === "ASSERTIVE") return "STABILIZE";
        return integrityOf(g) < 55 || driftOf(g) > 35
          ? "STABILIZE"
          : "REROUTE";
      },
      text: (g) =>
        integrityOf(g) < 55 || driftOf(g) > 35
          ? "Integrity is at risk."
          : "We can redirect load safely.",
    },
    {
      name: "ISHAAN",
      role: "RISK",
      decide: (g, strategy) => {
        if (strategy === "ASSERTIVE") return "STABILIZE";
        return driftOf(g) > 30 || loadOf(g) > 85 ? "STABILIZE" : "OBSERVE";
      },
      text: (g) =>
        driftOf(g) > 30 || loadOf(g) > 85
          ? "Instability is increasing."
          : "No immediate threat detected.",
    },
  ];

  return base.map((persona) => {
    const profile = getPersonaProfile(persona.name);
    const t = trust[persona.name] ?? 0;
    const i = ignored[persona.name] ?? 0;
    const bias = scenarioBias(game, persona.name);
    const mood = derivePersonaMood({
      trust: t,
      ignored: i,
      game,
    });

    const strategy = deriveStrategy(t, i);
    const rawAction = persona.decide(game, strategy);
    const action = applyProfileBias({ profile, action: rawAction, game });

    let text = persona.text(game);
    let confidence = "NEUTRAL";

    const confidenceAdjustment = profileConfidenceAdjustment(profile, game);

    if (t + bias + confidenceAdjustment >= 3) confidence = "HIGH";
    if (t + confidenceAdjustment <= -2) confidence = "LOW";

    if (bias > 0) {
      text += " This mode fits my domain.";
    }

    text = applyMoodToText({
      baseText: `${profileVoicePrefix(profile)} ${text}`,
      mood,
      action,
      name: persona.name,
      turn: game.turn,
    });

    return {
      name: persona.name,
      role: persona.role,
      action,
      text,
      trust: t,
      ignoredCount: i,
      strategy,
      confidence,
      temperament: profile?.temperament,
      riskBias: profile?.riskBias,
      defaultActionBias: profile?.defaultActionBias,
      scenarioBias: bias,
    };
  });
}
