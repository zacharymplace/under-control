import { getPersonaRecommendations } from "./personaEngine";

export function getActionHints(game: any) {
  const personas = getPersonaRecommendations(game);

  const scores: Record<string, number> = {
    STABILIZE: 0,
    REROUTE: 0,
    OBSERVE: 0,
  };

  personas.forEach((p) => {
    const trustWeight = 1 + (p.trust ?? 0) * 0.5;

    scores[p.action] += trustWeight;
  });

  const hints: Record<string, string> = {};

  Object.entries(scores).forEach(([action, score]) => {
    if (score >= 2) hints[action] = "Recommended";
    if (score >= 3) hints[action] = "Strongly recommended";
    if (score <= 0) hints[action] = "Low confidence";
  });

  return hints;
}
