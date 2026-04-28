export function getAdvisorAnticipation(personaName: string, game: any) {
  const name = personaName.toUpperCase();
  const tendency = game.playerTendency;

  if (!tendency) return null;

  const style = tendency.dominantStyle;

  if (style === "OBSERVE") {
    if (name === "ELENA") {
      return {
        note: "Anticipating another delay. Signal-seeking is becoming a pattern.",
        forceSuggestion: "REROUTE",
      };
    }

    if (name === "ISHAAN") {
      return {
        note: "Observation bias is increasing downside exposure.",
        forceSuggestion: "STABILIZE",
      };
    }
  }

  if (style === "REROUTE") {
    if (name === "MARA") {
      return {
        note: "Anticipating pressure relief at the cost of structure.",
        forceSuggestion: "STABILIZE",
      };
    }

    if (name === "ELENA") {
      return {
        note: "Reroute bias may be outrunning the signal.",
        forceSuggestion: "OBSERVE",
      };
    }
  }

  if (style === "STABILIZE") {
    if (name === "MARA") {
      return {
        note: "Stabilization bias is creating structural tunnel vision.",
        forceSuggestion: "REROUTE",
      };
    }

    if (name === "ISHAAN") {
      return {
        note: "Repeated stabilization may be delaying pressure release.",
        forceSuggestion: "REROUTE",
      };
    }
  }

  return null;
}
