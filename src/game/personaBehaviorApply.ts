import { PERSONA_BEHAVIORS, getThreatLevel } from "./personaBehavior";

export function applyPersonaBehavior(personas: any[], game: any) {
  const threat = getThreatLevel(game);

  if (threat === "NORMAL") return personas;

  return personas.map((p) => {
    const name = (p.name || "").toUpperCase();
    const behavior = PERSONA_BEHAVIORS[name];

    if (!behavior) return p;

    let nextSuggestion = p.suggests;

    if (threat === "HIGH") {
      if (behavior.stressResponse === "OVERSTRUCTURES") {
        nextSuggestion = "STABILIZE";
      }
      if (behavior.stressResponse === "OVERWARNS") {
        nextSuggestion = "STABILIZE";
      }
    }

    if (threat === "CRITICAL") {
      nextSuggestion = behavior.bias;
    }

    return {
      ...p,
      originalSuggests: p.suggests,
      suggests: nextSuggestion,
      behaviorNote: `${behavior.stressResponse} under ${threat} pressure`,
    };
  });
}
