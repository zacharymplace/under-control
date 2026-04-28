export function getAdvisorAnticipation(personaName: string, game: any) {
  const name = personaName.toUpperCase();
  const tendency = game.playerTendency;

  if (!tendency) return null;

  const style = tendency.dominantStyle;

  if (style === "OBSERVE") {
    if (name === "ELENA") {
      return {
        note: "You are defaulting to observation again. This pattern is now working against you.",
        forceSuggestion: "REROUTE",
      };
    }

    if (name === "ISHAAN") {
      return {
        note: "You keep waiting when action is required. Risk is compounding because of it.",
        forceSuggestion: "STABILIZE",
      };
    }
  }

  if (style === "REROUTE") {
    if (name === "MARA") {
      return {
        note: "You are using reroute as an escape. Structural damage is accumulating.",
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
