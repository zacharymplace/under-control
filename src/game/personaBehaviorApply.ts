import { PERSONA_BEHAVIORS, getThreatLevel } from "./personaBehavior";
import { getAdvisorAnticipation } from "./advisorAnticipation";

export function applyPersonaBehavior(personas: any[], game: any) {
  const threat = getThreatLevel(game);

  if (threat === "NORMAL") return personas;

  return personas.map((p) => {
    const name = (p.name || "").toUpperCase();
    const behavior = PERSONA_BEHAVIORS[name];

    if (!behavior) return p;

    let nextSuggestion = p.suggests;
    const memory = game.advisorMemory?.[name];
    const memoryStress = memory?.stressLevel ?? 0;
    const memoryIgnored = memory?.ignoredCount ?? 0;
    const anticipation = getAdvisorAnticipation(name, game);

    if (anticipation?.forceSuggestion) {
      nextSuggestion = anticipation.forceSuggestion;
    }

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

    const memoryMood =
      memoryIgnored >= 5
        ? "DISENGAGED"
        : memoryStress >= 3
        ? "ASSERTIVE"
        : p.mood;

    const memoryNote =
      memoryIgnored >= 5
        ? "Memory pressure: prior guidance has been repeatedly ignored."
        : memoryStress >= 3
        ? "Memory pressure: repeated poor outcomes are increasing urgency."
        : p.memoryNote || null;

    return {
      ...p,
      mood: memoryMood,
      memoryNote,
      anticipationNote: anticipation?.note || null,
      originalSuggests: p.suggests,
      suggests: nextSuggestion,
      behaviorNote: `${behavior.stressResponse} under ${threat} pressure`,
    };
  });
}
