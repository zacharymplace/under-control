import { PERSONA_BEHAVIORS, getThreatLevel } from "./personaBehavior";
import { getAdvisorAnticipation } from "./advisorAnticipation";

type PersonaBehaviorAdvisorMemory = {
  stressLevel?: number;
  ignoredCount?: number;
};

type PersonaBehaviorGameState = {
  advisorMemory?: Record<string, PersonaBehaviorAdvisorMemory | undefined>;
  playerTendency?: {
    dominantStyle?: string;
  } | null;
  pressure?: string;
  load?: number;
  drift?: number;
  integrity?: number;
  signalClarity?: number;
  signal?: number;
  [key: string]: unknown;
};

type PersonaBehaviorAdvisor = {
  name?: string;
  suggests?: string | null;
  mood?: string | null;
  memoryNote?: string | null;
  [key: string]: unknown;
};

export function applyPersonaBehavior(
  personas: PersonaBehaviorAdvisor[],
  game: PersonaBehaviorGameState
) {
  const threat = getThreatLevel(game);

  if (threat === "NORMAL") return personas;

  return personas.map((persona) => {
    const name = (persona.name || "").toUpperCase();
    const behavior = PERSONA_BEHAVIORS[name];

    if (!behavior) return persona;

    let nextSuggestion = persona.suggests;
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
        : persona.mood;

    const memoryNote =
      memoryIgnored >= 5
        ? "Memory pressure: prior guidance has been repeatedly ignored."
        : memoryStress >= 3
        ? "Memory pressure: repeated poor outcomes are increasing urgency."
        : persona.memoryNote || null;

    return {
      ...persona,
      mood: memoryMood,
      memoryNote,
      anticipationNote: anticipation?.note || null,
      originalSuggests: persona.suggests,
      suggests: nextSuggestion,
      behaviorNote: `${behavior.stressResponse} under ${threat} pressure`,
    };
  });
}
