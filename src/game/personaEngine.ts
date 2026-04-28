import { applyProfileBias, getPersonaProfile, profileConfidenceAdjustment, profileVoicePrefix } from "./personaProfile";
import { applyMoodToText, derivePersonaMood, moodInfluence } from "./personaMood";
function deriveStrategy(trust: number, ignored: number) {
  if (trust <= -2) return "DEFENSIVE";
  if (ignored >= 4) return "ASSERTIVE";
  return "ADAPTIVE";
}

function scenarioBias(game: any, name: string) {
  const id = game.scenarioId;

  if (id === "signal_chaos" && name === "ELENA") return 1;
  if (id === "load_crisis" && name === "ISHAAN") return 1;
  if (id === "drift_collapse" && name === "MARA") return 1;
  if (id === "drift_collapse" && name === "ISHAAN") return 1;

  return 0;
}

export function getPersonaRecommendations(game: any) {
  const trust = game.trust || {};
  const ignored = game.ignoredCounts || {};

  const base = [
    {
      name: "ELENA",
      role: "SIGNAL",
      decide: (g: any, strategy: string) => {
        if (strategy === "DEFENSIVE") return "OBSERVE";
        return g.signalClarity < 60 ? "OBSERVE" : "REROUTE";
      },
      text: (g: any) =>
        g.signalClarity < 60
          ? "We need better signal clarity."
          : "Signal is stable enough to act.",
    },
    {
      name: "MARA",
      role: "INFRASTRUCTURE",
      decide: (g: any, strategy: string) => {
        if (strategy === "ASSERTIVE") return "STABILIZE";
        return g.integrity < 55 || g.drift > 35 ? "STABILIZE" : "REROUTE";
      },
      text: (g: any) =>
        g.integrity < 55 || g.drift > 35
          ? "Integrity is at risk."
          : "We can redirect load safely.",
    },
    {
      name: "ISHAAN",
      role: "RISK",
      decide: (g: any, strategy: string) => {
        if (strategy === "ASSERTIVE") return "STABILIZE";
        return g.drift > 30 || g.load > 85 ? "STABILIZE" : "OBSERVE";
      },
      text: (g: any) =>
        g.drift > 30 || g.load > 85
          ? "Instability is increasing."
          : "No immediate threat detected.",
    },
  ];

  return base.map((p) => {
    const profile = getPersonaProfile(p.name);
    const t = trust[p.name] ?? 0;
    const i = ignored[p.name] ?? 0;
    const bias = scenarioBias(game, p.name);
    const mood = derivePersonaMood({
      trust: t,
      ignored: i,
      game,
    });

    const strategy = deriveStrategy(t, i);
    const rawAction = p.decide(game, strategy);
    const action = applyProfileBias({ profile, action: rawAction, game });

    let text = p.text(game);
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
      name: p.name,
      turn: game.turn,
    });

    return {
      name: p.name,
      role: p.role,
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
